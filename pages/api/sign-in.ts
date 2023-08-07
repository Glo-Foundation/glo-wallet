import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";
import {
  addNewGloAppUserToSheet,
  fetchEarlyAdoptersEmails,
  getReferrer,
} from "@/lib/spreadsheet";

const getOrCreate = async (address: string, email: string) => {
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        address,
      },
      select: {
        id: true,
      },
    });

    return user.id;
  } catch {
    const user = await prisma.user.create({
      data: {
        address,
        email,
      },
    });

    // Verify if new user has already completed the EA cta
    const emails = await fetchEarlyAdoptersEmails();

    if (emails.has(email)) {
      await prisma.cTAs.create({
        data: {
          type: "JOIN_PROGRAM" as CTAType,
          userId: user.id,
          isCompleted: true,
        },
      });
    }

    // Append to marketing outreach spreadsheet
    await addNewGloAppUserToSheet(user);

    return user.id;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["glo-pub-address"] as string;
  const { email } = req.body;

  // Do not pass empty string
  const userId = await getOrCreate(address, email || null);

  return res.status(200).json(userId);
}
