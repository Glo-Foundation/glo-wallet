import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Fetch the data from the existing source
    const { data } = await axios.get(
      "https://app.glodollar.org/api/funding/current"
    );

    if (!data || !data.possibleFundingChoices) {
      return res.status(400).json({ message: "Invalid data received." });
    }

    // Store the data in the database
    await prisma.fundingChoicesCache.create({
      data: {
        choices: data.possibleFundingChoices, // Save as JSON
      },
    });

    return res
      .status(200)
      .json({ message: "Funding choices updated successfully." });
  } catch (error) {
    console.error("Error updating funding choices:", error);
    res.status(500).json({ message: "Failed to update funding choices." });
  }
}
