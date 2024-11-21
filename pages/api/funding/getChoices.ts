import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Retrieve the most recent entry from the database
    const latestChoices = await prisma.fundingChoicesCache.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!latestChoices) {
      return res.status(404).json({ message: "No funding choices found." });
    }

    return res
      .status(200)
      .json({ possibleFundingChoices: latestChoices.choices });
  } catch (error) {
    console.error("Error fetching funding choices:", error);
    res.status(500).json({ message: "Failed to fetch funding choices." });
  }
}
