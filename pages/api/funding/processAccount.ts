import { BalanceCharity, Charity } from "@prisma/client";
import axios from "axios";
import { BigNumber } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { Chain } from "viem";

import { getAverageBalance, getBalances, getStellarTxs } from "@/lib/balance";
import { fetchGloTransactions } from "@/lib/blockscout-explorer";
import {
  CHARITY_MAP,
  DEFAULT_CHARITY_PER_CHAIN,
  getChains,
  getMarketCap,
  getStellarMarketCap,
} from "@/lib/utils";
import prisma from "lib/prisma";

type ChoicesDict = {
  [key: string]: Choice[];
};

type Choice = {
  name: Charity;
  percent: number;
};
type Body = {
  runId: number;
  choicesByAddress: ChoicesDict;
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
  const { runId, choicesByAddress } = req.body as Body;

  const address = Object.keys(choicesByAddress)[0];
  const choicesArr = choicesByAddress[address];
  delete choicesByAddress[address];

  const processed = await processAccount(address, choicesArr);

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

  if (Object.keys(choicesByAddress).length > 1) {
    axios.post(
      `${process.env.VERCEL_OG_URL}/api/funding/processAccount`,
      {
        runId,
        choicesByAddress,
      },
      {
        headers: {
          Authorization: process.env.WEBHOOK_API_KEY,
        },
      }
    );
    return res.status(200).json({});
  }

  const result = await buildSummary(runId);

  await prisma.balanceOnDate.update({
    where: {
      id: runId,
    },
    data: {
      balancesData: result,
      isProcessed: true,
    },
  });

  return res.status(200).json({});
}

const buildSummary = async (runId: number) => {
  const records = await prisma.balanceCharity.findMany({
    where: {
      runId,
    },
  });

  const { allocated, choices } = flattenRecords(records!);
  const possibleFundingChoices = await calculateBalances(allocated, choices);

  return possibleFundingChoices;
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

  const allocated: { [key: string]: BigNumber } = Object.keys(
    chainsObject
  ).reduce((acc, cur) => ({ ...acc, [cur]: BigNumber.from(0) }), {
    stellar: BigNumber.from(0),
  });

  const possibleFundingChoices: { [key: string]: number } = Object.keys(
    Charity
  ).reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {});

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

const flattenRecords = (records: BalanceCharity[]) => {
  const choices = Object.keys(CHARITY_MAP).reduce(
    (acc, cur) => ({ ...acc, [cur]: 0 }),
    {} as { [key: string]: number }
  );
  const allocated = Object.keys(getChainsObjects()).reduce(
    (acc, cur) => ({ ...acc, [cur]: BigNumber.from(0) }),
    { stellar: BigNumber.from(0) } as { [key: string]: BigNumber }
  );
  for (const r of records) {
    const balances = r.balancesData as {
      [key: string]: string;
    };
    const choicesData = r.charityData as {
      [key: string]: number;
    };
    for (const [choice, value] of Object.entries(choicesData)) {
      choices[choice] += value;
    }
    for (const [chain, value] of Object.entries(balances)) {
      allocated[chain] = allocated[chain].add(BigNumber.from(value));
    }
  }

  return { allocated, choices };
};

const calculateBalances = async (
  allocated: {
    [key: string]: BigNumber;
  },
  choices: {
    [key: string]: number;
  }
) => {
  const chainObjects = Object.entries(getChainsObjects()).map(
    ([key, chain]) => ({
      id: chain.id,
      name: key,
    })
  );
  chainObjects.push({ id: 0, name: "stellar" });

  for (const chain of chainObjects) {
    const { id, name } = chain;

    const marketCap = await (id > 0
      ? getMarketCap(id)
      : getStellarMarketCap().then((x) =>
          BigNumber.from(x).mul(BigInt(10 ** 18))
        ));
    const charity = DEFAULT_CHARITY_PER_CHAIN(id.toString());

    choices[charity] += marketCap
      .sub(allocated[name])
      .div(BigInt(10 ** 18))
      .toNumber();
  }
  return choices;
};

const getChainsObjects = () => {
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
  return chainsObject;
};
