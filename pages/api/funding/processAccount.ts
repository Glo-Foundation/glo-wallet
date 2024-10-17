import { Charity } from "@prisma/client";
import { BigNumber } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

import { getAverageBalance, getBalances, getStellarTxs } from "@/lib/balance";
import { fetchGloTransactions } from "@/lib/blockscout-explorer";
import { getChainsObjects } from "@/lib/utils";
import prisma from "lib/prisma";

type Choice = {
  name: Charity;
  percent: number;
};

type Body = {
  runId: number;
  address: string;
  choices: Choice[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    !process.env.WEBHOOK_API_KEY ||
    req.headers.authorization !== process.env.WEBHOOK_API_KEY
  ) {
    return res.status(401).json({ message: "Incorrect token" });
  }
  const { runId, address, choices } = req.body as Body;

  const processed = await processAccount(address, choices);

  await prisma.balanceCharity.create({
    data: {
      address,
      runId: runId,
      balancesData: Object.entries(processed.allocated).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value.toString() }),
        {}
      ),
      charityData: processed.possibleFundingChoices,
    },
  });

  return res.status(200).json({});
}

const processAccount = async (address: string, choices: Choice[]) => {
  const chainsObject = getChainsObjects();
  const date = new Date();
  const firstLastMonth = new Date(
    Date.UTC(date.getFullYear(), date.getMonth() - 1, 1)
  );
  const firstThisMonth = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), 1)
  );
  const decimals = BigInt(10 ** 18);

  const allocated: { [key: string]: BigNumber } = Object.keys(
    chainsObject
  ).reduce((acc, cur) => ({ ...acc, [cur]: BigNumber.from(0) }), {
    stellar: BigNumber.from(0),
  });

  const possibleFundingChoices: { [key: string]: number } = Object.keys(
    Charity
  ).reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {});

  console.log(`ProcessAccount - ${address}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const balancesEndOfMonth: any = await getBalances(address, firstThisMonth);

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

  const isStellar = !address.startsWith("0x");

  for (const [key] of Object.entries(balancesEndOfMonth)) {
    if (key == "totalBalance") {
      continue;
    }
    if (key == "stellarBalance") {
      if (!isStellar) {
        continue;
      }
      const stellarBalance = await getAverageStellarBalance(
        address,
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
        address,
        chainsObject[chainName],
        chainName,
        firstLastMonth,
        firstThisMonth
      );
      const averageBalance = await getAverageBalance(
        address,
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

  choices.forEach((choice) => {
    const { percent, name } = choice;
    const balance = averageTotalBalanceThisMonth
      .mul(percent)
      .div(100)
      .div(decimals)
      .toNumber();
    possibleFundingChoices[name] = possibleFundingChoices[name] + balance;
  });

  return {
    possibleFundingChoices: Object.fromEntries(
      Object.entries(possibleFundingChoices).filter(([, value]) => value > 0)
    ),
    allocated: Object.fromEntries(
      Object.entries(allocated).filter(([, value]) => !value.isZero())
    ),
  };
};
