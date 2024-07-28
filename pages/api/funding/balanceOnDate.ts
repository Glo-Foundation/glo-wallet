import { Charity, CharityChoice } from "@prisma/client";
import { BigNumber } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

import { getBalances, getAverageBalance } from "@/lib/balance";
import { fetchGloTransactions } from "@/lib/blockscout-explorer";
import { getChains } from "@/lib/utils";
import prisma from "lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const chains = getChains();
  const chainsObject: Record<string, any> = chains.reduce(
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
  const firstLastMonth = new Date(
    Date.UTC(date.getFullYear(), date.getMonth() - 1, 1)
  );
  const decimals = BigInt(10 ** 18);

  const allFundingChoices = await prisma.charityChoice.findMany({
    where: {
      creationDate: {
        lt: firstThisMonth.toISOString(),
      },
      name: { not: "OPEN_SOURCE" },
    },
    distinct: ["address", "name"],
    orderBy: {
      choiceNum: "desc",
    },
  });

  const possibleFundingChoices: { [key: string]: number } = Object.keys(
    Charity
  ).reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {});
  delete possibleFundingChoices["OPEN_SOURCE"];

  const choicesByAddress = allFundingChoices.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.address]: [...(acc[cur.address] || []), cur],
    }),
    {} as { [key: string]: CharityChoice[] }
  );

  for await (const walletAddress of Object.keys(choicesByAddress)) {
    const choices = choicesByAddress[walletAddress];
    if (!choices.length) {
      return;
    }

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

    if (balancesEndOfMonth.totalBalance !== balancesStartOfMonth.totalBalance) {
      for (const [key] of Object.entries(balancesEndOfMonth)) {
        const startBalance = balancesStartOfMonth[key].toString();
        const endBalance = balancesEndOfMonth[key].toString();

        if (endBalance !== startBalance && key !== "totalBalance") {
          const chainName = key.replace("Balance", "");
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
      const number = BigInt(balancesEndOfMonth["totalBalance"]) * decimals;
      averageTotalBalanceThisMonth = BigNumber.from(number);
    }

    choices.forEach((choice) => {
      const { percent, name } = choice;
      const balance = averageTotalBalanceThisMonth
        .mul(percent)
        .div(100)
        .div(decimals)
        .toNumber();
      possibleFundingChoices[name] = possibleFundingChoices[name] + balance;
    });
  }

  return res.status(200).json({ possibleFundingChoices });
}
