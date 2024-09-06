import { Charity, CharityChoice } from "@prisma/client";
import { BigNumber } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { Chain } from "viem";

import { getBalances, getAverageBalance, getStellarTxs } from "@/lib/balance";
import { fetchGloTransactions } from "@/lib/blockscout-explorer";
import {
  DEFAULT_CHARITY_PER_CHAIN,
  getChains,
  getMarketCap,
  getStellarMarketCap,
} from "@/lib/utils";
import prisma from "lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const chains = getChains();
  const chainsObject: Record<string, Chain> = chains.reduce(
    (a, v) => ({
      ...a,
      [["Ethereum", "Polygon"].includes(v.name)
        ? v.name.toLowerCase()
        : v.network]: v,
    }),
    {}
  );

  const date = new Date();
  const firstLastMonth = new Date(
    Date.UTC(date.getFullYear(), date.getMonth() - 1, 1)
  );
  const firstThisMonth = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), 1)
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

  const allocated: { [key: string]: BigNumber } = Object.keys(
    chainsObject
  ).reduce((acc, cur) => ({ ...acc, [cur]: BigNumber.from(0) }), {
    stellar: BigNumber.from(0),
  });

  const possibleFundingChoices: { [key: string]: number } = Object.keys(
    Charity
  ).reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {});

  const choicesByAddress = allFundingChoices.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.address]: [...(acc[cur.address] || []), cur],
    }),
    {} as { [key: string]: CharityChoice[] }
  );

  for await (const walletAddress of Object.keys(choicesByAddress)) {
    const choices = choicesByAddress[walletAddress];
    const lastChoiceNum = Math.max(...choices.map((x) => x.choiceNum));
    const filteredChoices = choices.filter(
      (x) => x.choiceNum === lastChoiceNum
    );
    if (!choices.length) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const balancesEndOfMonth: any = await getBalances(
      walletAddress,
      firstThisMonth
    );

    let averageTotalBalanceThisMonth = BigNumber.from("0");

    const getAverageStellarBalance = async (
      address: string,
      start: Date,
      end: Date,
      balance: BigNumber
    ) => {
      const milisecondsInMonthString = end.valueOf() - start.valueOf();
      const milisecondsInMonth = BigNumber.from(
        milisecondsInMonthString.toString()
      );
      let totalBalance = BigNumber.from("0");
      let currentDate = end;
      let currentBalance = balance;

      const txs = await getStellarTxs(address, firstLastMonth, firstThisMonth);
      for (const tx of txs) {
        const txDate = new Date(1000 * parseInt(tx.timeBounds?.maxTime || "0"));

        const balanceTime = BigNumber.from(
          (currentDate.valueOf() - txDate.valueOf()).toString()
        );
        let transactionDelta = BigNumber.from(0);
        for (const op of tx.operations) {
          if (op.type === "payment" && op.asset.code === "USDGLO") {
            const incoming = op.destination === address;
            const x = BigNumber.from(op.amount.replace(".", ""));
            transactionDelta = incoming
              ? transactionDelta.add(x)
              : transactionDelta.sub(x);
          }
        }

        const weightedBalance = currentBalance.mul(balanceTime);
        totalBalance = totalBalance.add(weightedBalance);
        currentDate = txDate;
        currentBalance = currentBalance.add(transactionDelta);
      }

      const balanceTime = currentDate.valueOf() - start.valueOf();
      const weightedBalance = currentBalance.mul(BigNumber.from(balanceTime));
      totalBalance = totalBalance.add(weightedBalance);

      const averageBalance = totalBalance.div(milisecondsInMonth);

      return averageBalance;
    };

    const isStellar = !walletAddress.startsWith("0x");

    for (const [key] of Object.entries(balancesEndOfMonth)) {
      if (key == "totalBalance") {
        continue;
      }
      if (key == "stellarBalance") {
        if (!isStellar) {
          continue;
        }
        const stellarBalance = await getAverageStellarBalance(
          walletAddress,
          firstLastMonth,
          firstThisMonth,
          balancesEndOfMonth[key]
        );
        const stellarAdjusted = stellarBalance.mul(BigInt(10 ** 11)); // To ETH precision;
        averageTotalBalanceThisMonth =
          averageTotalBalanceThisMonth.add(stellarAdjusted);
        allocated["stellar"] = allocated["stellar"].add(stellarAdjusted);
      } else if (!isStellar) {
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

        allocated[chainName] = allocated[chainName].add(averageBalance);
      }
    }

    filteredChoices.forEach((choice) => {
      const { percent, name } = choice;
      const balance = averageTotalBalanceThisMonth
        .mul(percent)
        .div(100)
        .div(decimals)
        .toNumber();
      possibleFundingChoices[name] = possibleFundingChoices[name] + balance;
    });
  }

  const final = await calculateRemainingPerCharity(
    chainsObject,
    allocated,
    possibleFundingChoices
  );

  return res.status(200).json({ possibleFundingChoices: final });
}

const calculateRemainingPerCharity = async (
  chains: Record<string, Chain>,
  allocated: {
    [key: string]: BigNumber;
  },
  choices: {
    [key: string]: number;
  }
) => {
  const chainObjects = Object.entries(chains).map(([key, chain]) => ({
    id: chain.id,
    name: key,
  }));
  chainObjects.push({ id: 0, name: "stellar" });

  for (const chain of chainObjects) {
    const { id, name } = chain;
    console.log({ id, name });
    const marketCap = await (id > 0
      ? getMarketCap(id)
      : getStellarMarketCap().then((x) =>
          BigNumber.from(x).mul(BigInt(10 ** 18))
        ));
    const charity = DEFAULT_CHARITY_PER_CHAIN(id.toString());

    console.log({
      marketCap: marketCap.toString(),
      allocated: allocated[name].toString(),
    });
    choices[charity] += marketCap
      .sub(allocated[name])
      .div(BigInt(10 ** 18))
      .toNumber();
  }
  return choices;
};
