import { Charity } from "@prisma/client";

import { getAverageBalance, getBalances, getStellarTxs } from "@/lib/balance";
import { fetchGloTransactions } from "@/lib/blockscout-explorer";
import { getChainsObjects } from "@/lib/utils";
import prisma from "lib/prisma";

type Choice = {
  name: Charity;
  percent: number;
};

export const handleProcessAccount = async (
  runId: number,
  address: string,
  choices: Choice[]
) => {
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
};

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

  const allocated: { [key: string]: bigint } = Object.keys(chainsObject).reduce(
    (acc, cur) => ({ ...acc, [cur]: BigInt(0) }),
    {
      stellar: BigInt(0),
    }
  );

  const possibleFundingChoices: { [key: string]: number } = Object.keys(
    Charity
  ).reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {});

  console.log(`ProcessAccount - ${address}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const balancesEndOfMonth: any = await getBalances(address, firstThisMonth);

  let averageTotalBalanceThisMonth = BigInt("0");

  const getAverageStellarBalance = async (
    address: string,
    start: Date,
    end: Date,
    balance: bigint
  ) => {
    const milisecondsInMonthString = end.valueOf() - start.valueOf();
    const milisecondsInMonth = BigInt(milisecondsInMonthString.toString());
    let totalBalance = BigInt(0);
    let currentDate = end;
    let currentBalance = balance * BigInt(10 ** 7);

    const txs = await getStellarTxs(address, firstLastMonth, firstThisMonth);
    for (const [txDate, ops] of txs) {
      const balanceTime = BigInt(
        (currentDate.valueOf() - txDate.valueOf()).toString()
      );
      let transactionDelta = BigInt(0);
      for (const op of ops) {
        const incoming = op.destination === address;
        const x = BigInt(op.amount.replace(".", ""));
        transactionDelta = incoming
          ? transactionDelta - x
          : transactionDelta + x;
      }

      const weightedBalance = currentBalance * balanceTime;
      totalBalance = totalBalance + weightedBalance;
      currentDate = txDate;
      currentBalance = currentBalance + transactionDelta;
    }

    const balanceTime = currentDate.valueOf() - start.valueOf();
    const weightedBalance = currentBalance * BigInt(balanceTime);
    totalBalance = totalBalance + weightedBalance;

    const averageBalance = totalBalance / milisecondsInMonth;

    return averageBalance;
  };

  const isStellar = !address.includes("0x");
  for (const [key] of Object.entries(balancesEndOfMonth)) {
    // TODO: Temp skip Ve chain
    if (key == "totalBalance" || key == "vechainBalance") {
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
      const stellarAdjusted = stellarBalance * BigInt(10 ** 11); // To ETH precision;
      averageTotalBalanceThisMonth =
        averageTotalBalanceThisMonth + stellarAdjusted;
      allocated["stellar"] = allocated["stellar"] + stellarAdjusted;
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
        address.startsWith("ve") ? address.slice(2) : address,
        firstLastMonth,
        firstThisMonth,
        balancesEndOfMonth[key],
        gloTransactionsLastMonth
      );
      averageTotalBalanceThisMonth =
        averageTotalBalanceThisMonth + averageBalance;

      allocated[chainName] = allocated[chainName] + averageBalance;
    }
  }

  choices.forEach((choice) => {
    const { percent, name } = choice;
    const balance =
      (averageTotalBalanceThisMonth * BigInt(percent)) / BigInt(100) / decimals;
    possibleFundingChoices[name] =
      possibleFundingChoices[name] + Number(balance);
  });

  return {
    possibleFundingChoices: Object.fromEntries(
      Object.entries(possibleFundingChoices).filter(([, value]) => value > 0)
    ),
    allocated: Object.fromEntries(
      Object.entries(allocated).filter(([, value]) => value != BigInt(0))
    ),
  };
};
