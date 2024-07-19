import { NextApiRequest, NextApiResponse } from "next";

import { getBalances } from "@/lib/balance";
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

  const possibleFundingChoices: any = {};

  possibleFundingChoicesData.forEach((fundingChoice) => {
    possibleFundingChoices[fundingChoice.name] = 0;
  });

  let fundingChoicesSummed = 0;

  allFundingChoices.forEach(async (fundingChoice) => {
    if (fundingChoice.name !== "OPEN_SOURCE") {
      const { totalBalance: balance } = await getBalances(
        fundingChoice.address
      );
      possibleFundingChoices[fundingChoice.name] =
        possibleFundingChoices[fundingChoice.name] + balance;
    }
    fundingChoicesSummed++;
    if (fundingChoicesSummed === allFundingChoices.length) {
      return res.status(200).json({ possibleFundingChoices });
    }
  });
}
