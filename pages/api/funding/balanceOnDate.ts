import { BalanceCharity, Charity, CharityChoice } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Chain } from "viem";

import {
  getAvgMarketCap,
  getAvgStellarMarketCap,
} from "@/lib/blockscout-explorer";
import {
  CHARITY_MAP,
  DEFAULT_CHARITY_PER_CHAIN,
  getChainsObjects,
} from "@/lib/utils";
import prisma from "lib/prisma";

import { handleProcessAccount } from "../../../lib/processAccount";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const date = new Date();

  const firstThisMonth = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), 1)
  );

  const allFundingChoices = await prisma.charityChoice.findMany({
    where: {
      creationDate: {
        lt: firstThisMonth.toISOString(),
      },
    },
    distinct: ["address", "name"],
    orderBy: {
      choiceNum: "desc",
    },
  });

  const last = await prisma.balanceOnDate.findFirst({
    orderBy: {
      ts: "desc",
    },
  });

  const oneDayMili = 60 * 60 * 24 * 1000;
  const isExpired =
    !last || new Date().getTime() - last?.ts.getTime() > oneDayMili;

  if (last && last.isProcessed && !isExpired) {
    return res.status(200).json({
      runId: last.id,
      generatedAt: last.ts,
      isProcessing: true,
      ...{ result: last.balancesData || {} },
    });
  }

  const alreadyProcessedAddresses: string[] = [];

  let runId: number;
  let jobTs = last?.ts;
  if (!last || last?.isProcessed) {
    const job = await prisma.balanceOnDate.create({ data: {} });
    runId = job.id;
    jobTs = job.ts;
  } else {
    runId = last.id;
    const res = await prisma.balanceCharity.findMany({
      where: {
        runId,
      },
      select: {
        address: true,
      },
    });
    alreadyProcessedAddresses.push(...res.map((x) => x.address));
  }

  const choicesByAddress = allFundingChoices.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.address]: [...(acc[cur.address] || []), cur],
    }),
    {} as {
      [key: string]: CharityChoice[];
    }
  );

  const filteredChoicesByAddress = {} as {
    [key: string]: {
      name: Charity;
      percent: number;
    }[];
  };

  for (const address of Object.keys(choicesByAddress)) {
    const choices = choicesByAddress[address];
    const lastChoiceNum = Math.max(...choices.map((x) => x.choiceNum));
    const filteredChoices = choices.filter(
      (x) => x.choiceNum === lastChoiceNum
    );
    if (!filteredChoices.length) {
      return;
    }

    filteredChoicesByAddress[address] = filteredChoices.map((x) => ({
      name: x.name,
      percent: x.percent,
    }));
  }

  console.log(
    `BalanceOnDate - processing ${
      Object.keys(filteredChoicesByAddress).length
    } adresses (already processes ${alreadyProcessedAddresses.length})`
  );

  for (const address of Object.keys(filteredChoicesByAddress)) {
    if (alreadyProcessedAddresses.includes(address)) {
      continue;
    }

    try {
      await handleProcessAccount(
        runId,
        address,
        filteredChoicesByAddress[address]
      );
    } catch (err) {
      console.error(err);
      return res.status(200).json({
        msg: "Probably a timeout",
      });
    }
  }

  console.log("BalanceOnDate - building summary");

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

  return res.status(200).json({
    runId,
    generatedAt: jobTs,
    isProcessing: false,
    ...result,
  });
}

const buildSummary = async (runId: number) => {
  const records = await prisma.balanceCharity.findMany({
    where: {
      runId,
    },
  });

  const { allocated, choices } = flattenRecords(records!);
  const result = await calculateBalances(allocated, choices);

  return result;
};

const flattenRecords = (records: BalanceCharity[]) => {
  const choices = Object.keys(CHARITY_MAP).reduce(
    (acc, cur) => ({ ...acc, [cur]: 0 }),
    {} as { [key: string]: number }
  );
  const allocated = Object.keys(getChainsObjects()).reduce(
    (acc, cur) => ({ ...acc, [cur]: BigInt(0) }),
    { stellar: BigInt(0) } as { [key: string]: bigint }
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
      allocated[chain] = allocated[chain] + BigInt(value);
    }
  }

  return { allocated, choices };
};

const calculateBalances = async (
  allocated: {
    [key: string]: bigint;
  },
  choices: {
    [key: string]: number;
  }
) => {
  const date = new Date();
  const startDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth() - 1, 1)
  );
  const endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));

  const chainObjects: ChainObject[] = Object.entries(getChainsObjects()).map(
    ([key, chain]) => ({
      id: chain.id,
      name: key,
      chain,
    })
  );
  chainObjects.push({ id: 0, name: "stellar" });

  const marketCaps: { [name: string]: number } = {};
  for (const c of chainObjects) {
    const { id, name, chain } = c;
    const marketCap = await (id > 0
      ? getAvgMarketCap(chain!, name, startDate, endDate)
      : getAvgStellarMarketCap(startDate, endDate).then(
          (x) => BigInt(x) * BigInt(10 ** 11)
          // To flatten with Eth balances - 7 + 11 => 18
        ));
    const charity = DEFAULT_CHARITY_PER_CHAIN(id.toString());

    marketCaps[name] = Number(marketCap / BigInt(10 ** 18));

    choices[charity] += Number(
      (marketCap - allocated[name]) / BigInt(10 ** 18)
    );
  }

  const addTotal = (dict: { [name: string]: number }) => ({
    ...dict,
    _total: Object.values(dict).reduce((acc, cur) => acc + cur, 0),
  });

  return {
    possibleFundingChoices: addTotal(choices),
    marketCaps: addTotal(marketCaps),
  };
};

type ChainObject = {
  id: number;
  name: string;
  chain?: Chain;
};
