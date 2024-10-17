import { Charity, CharityChoice } from "@prisma/client";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

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

  const previous = await prisma.balanceOnDate.findFirst({
    where: {
      isProcessed: true,
    },
    orderBy: {
      ts: "desc",
    },
  });

  if (last && !isExpired) {
    const isProcessing = !last.isProcessed;
    const previousRun = {
      runId: previous?.id,
      possibleFundingChoices: previous?.balancesData,
      generatedAt: previous?.ts,
    };
    return res.status(200).json({
      runId: last.id,
      generatedAt: last.ts,
      isProcessing,
      possibleFundingChoices: last.balancesData,
      ...(isProcessing ? { previousRun } : {}),
    });
  }

  const job = await prisma.balanceOnDate.create({ data: {} });
  const { id: runId } = job;

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
    } adresses`
  );

  axios.post(
    `${process.env.VERCEL_OG_URL}/api/funding/processAccount`,
    {
      runId,
      choicesByAddress: filteredChoicesByAddress,
    },
    {
      headers: {
        Authorization: process.env.WEBHOOK_API_KEY,
      },
    }
  );

  return res.status(200).json({
    runId: job.id,
    generatedAt: job.ts,
    isProcessing: true,
    previousRun: {
      runId: previous?.id,
      possibleFundingChoices: previous?.balancesData,
      generatedAt: previous?.ts,
    },
  });
}
