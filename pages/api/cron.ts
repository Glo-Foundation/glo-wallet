import { NextApiRequest, NextApiResponse } from "next";

import { getBalances } from "@/lib/balance";
import prisma from "@/lib/prisma";
import { DEFAULT_CHARITY_PER_CHAIN, getChainsObjects } from "@/lib/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authHeader = req.headers["authorization"];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Fetch funding choices
    const allFundingChoices = await prisma.charityChoice.findMany({
      distinct: ["address"],
      orderBy: { choiceNum: "desc" },
    });

    const possibleFundingChoicesData = await prisma.charityChoice.findMany({
      where: { name: { not: "OPEN_SOURCE" } },
      distinct: ["name"],
      select: { name: true },
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

    // Store the result in DB
    await prisma.fundingChoicesCache.create({
      data: {
        choices: possibleFundingChoices, // Save choices as JSON in DB
      },
    });

    res
      .status(200)
      .json({ message: "Funding choices updated and saved to DB." });
  } catch (error) {
    console.error("Error updating funding choices:", error);
    res.status(500).json({ message: "Failed to update funding choices." });
  }
}
