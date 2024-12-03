import { NextApiRequest, NextApiResponse } from "next";

import { getBalances } from "@/lib/balance";
import { DEFAULT_CHARITY_PER_CHAIN, getChainsObjects } from "@/lib/utils";
import prisma from "lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const allFundingChoices = await prisma.charityChoice.findMany({
    distinct: ["address"],
    orderBy: {
      choiceNum: "desc",
    },
  });

  const possibleFundingChoicesData = await prisma.charityChoice.findMany({
    where: {
      name: { not: "OPEN_SOURCE" },
    },
    distinct: ["name"],
    select: {
      name: true,
    },
  });

  const possibleFundingChoices: { [key: string]: number } = {};

  possibleFundingChoicesData.forEach((fundingChoice) => {
    possibleFundingChoices[fundingChoice.name] = 0;
  });

  let fundingChoicesSummed = 0;

  for (const fundingChoice of allFundingChoices) {
    if (fundingChoice.name !== "OPEN_SOURCE") {
      const { totalBalance: balance } = await getBalances(
        fundingChoice.address
      );
      possibleFundingChoices[fundingChoice.name] += balance;
    }
    fundingChoicesSummed++;
  }

  //default funding choices per chain
  const chainObjects = Object.entries(getChainsObjects()).map(
    ([key, chain]) => ({
      name: key,
      chain,
    })
  );

  for (const { name } of chainObjects) {
    const defaultCharity = DEFAULT_CHARITY_PER_CHAIN(name);
    if (
      defaultCharity &&
      possibleFundingChoices[defaultCharity] !== undefined
    ) {
      possibleFundingChoices[defaultCharity] += 0;
    }
  }

  return res.status(200).json({ possibleFundingChoices });
}
