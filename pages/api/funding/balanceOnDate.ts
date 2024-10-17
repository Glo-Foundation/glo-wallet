import { BalanceCharity, Charity, CharityChoice } from "@prisma/client";
import axios from "axios";
import { BigNumber } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

import {
  backendUrl,
  CHARITY_MAP,
  DEFAULT_CHARITY_PER_CHAIN,
  getChainsObjects,
  getMarketCap,
  getStellarMarketCap,
} from "@/lib/utils";
import prisma from "lib/prisma";

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
      name: { not: "OPEN_SOURCE" },
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
      ...(last.balancesData
        ? { possibleFundingChoices: last.balancesData }
        : {}),
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
      await axios.post(
        `${backendUrl}/api/funding/processAccount`,
        {
          runId,
          address,
          choices: filteredChoicesByAddress[address],
        },
        {
          headers: {
            Authorization: process.env.WEBHOOK_API_KEY,
          },
        }
      );
    } catch (err) {
      console.error(err);
      return res.status(200).json({
        msg: "Probably a timetout",
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
    possibleFundingChoices: result,
  });
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
