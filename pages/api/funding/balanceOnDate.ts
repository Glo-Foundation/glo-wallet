import { Charity } from "@prisma/client";
import { BigNumber } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

import { getBalances, getAverageBalance } from "@/lib/balance";
import { fetchGloTransactions } from "@/lib/blockscout-explorer";
import { getChains } from "@/lib/utils";
import { getBalance } from "@/utils";
import prisma from "lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const chains = getChains();
  const chainsObject: object = chains.reduce(
    (a, v) => ({
      ...a,
      [["Ethereum", "Polygon"].includes(v.name)
        ? v.name.toLowerCase()
        : v.network]: v,
    }),
    {}
  );

  const date = new Date();
  const firstThisMonth = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), 1)
  );
  // const firstThisMonth = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
  const firstLastMonth = new Date(
    Date.UTC(date.getFullYear(), date.getMonth() - 1, 1)
  );
  const decimals = BigInt(10 ** 18);

  const allFundingChoices = await prisma.charityChoice.findMany({
    distinct: ["address"],
    orderBy: {
      choiceNum: "desc",
    },
  });

  const possibleFundingChoicesData = await prisma.charityChoice.findMany({
    where: {
      name: { not: "EXTREME_POVERTY" },
    },
    distinct: ["name"],
    select: {
      name: true,
    },
  });

  const possibleFundingChoices = Object.keys(Charity).reduce(function (
    map,
    obj
  ) {
    map[obj] = 0;
    return map;
  },
  {});

  let fundingChoicesSummed = 0;

  allFundingChoices.forEach(async (fundingChoice) => {
    if (fundingChoice.name !== "EXTREME_POVERTY") {
      const walletAddress = fundingChoice.address;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const balancesEndOfMonth: any = await getBalances(
        walletAddress,
        firstThisMonth
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const balancesStartOfMonth: any = await getBalances(
        walletAddress,
        firstLastMonth
      );

      let averageTotalBalanceThisMonth = BigNumber.from("0");

      console.log("going to start processing: ", walletAddress);

      if (
        balancesEndOfMonth.totalBalance !== balancesStartOfMonth.totalBalance
      ) {
        console.log("balances end of month: ", balancesEndOfMonth);
        console.log("balances start of month: ", balancesStartOfMonth);
        for (const [key, value] of Object.entries(balancesEndOfMonth)) {
          const startBalance = balancesStartOfMonth[key].toString();
          const endBalance = balancesEndOfMonth[key].toString();

          if (endBalance !== startBalance && key !== "totalBalance") {
            const chainName = key.replace("Balance", "");
            console.log("checking balance of: ", chainName);
            const gloTransactionsLastMonth = await fetchGloTransactions(
              walletAddress,
              chainsObject[chainName],
              chainName,
              firstLastMonth,
              firstThisMonth
            );
            const averageBalance = await getAverageBalance(
              walletAddress,
              firstLastMonth,
              firstThisMonth,
              balancesEndOfMonth[key],
              gloTransactionsLastMonth
            );
            averageTotalBalanceThisMonth =
              averageTotalBalanceThisMonth.add(averageBalance);
          } else if (key !== "totalBalance") {
            // populate end of month balances
            averageTotalBalanceThisMonth = averageTotalBalanceThisMonth.add(
              balancesEndOfMonth[key]
            );
          }
        }
      } else {
        averageTotalBalanceThisMonth.add(balancesEndOfMonth["totalBalance"]);
      }

      console.log(
        "average balances ",
        "" + walletAddress + ": " + averageTotalBalanceThisMonth
      );
      const balance = averageTotalBalanceThisMonth.div(decimals).toNumber();
      possibleFundingChoices[fundingChoice.name] =
        possibleFundingChoices[fundingChoice.name] + balance;
    }
    fundingChoicesSummed++;
    if (fundingChoicesSummed === allFundingChoices.length) {
      return res.status(200).json({ possibleFundingChoices });
    }
  });
}
