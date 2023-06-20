import prisma from "@/lib/prisma";
import { fetchEarlyAdoptersEmails } from "@/lib/spreadsheet";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.query.key !== process.env.VERCEL_WEBHOOK_KEY) {
    return res.status(401).end();
  }

  const emails = await fetchEarlyAdoptersEmails();

  // Find users with defined email and no JOIN_PROGRAM cta
  const users = await prisma?.user.findMany({
    where: {
      AND: {
        NOT: {
          email: null,
        },
        ctas: {
          none: {
            type: "JOIN_PROGRAM" as CTAType,
          },
        },
      },
    },
  });

  // Filter our users that did not complete the EA cta
  const earlyAdopters = users.filter(
    (user) => user.email && emails.has(user.email)
  );

  if (!earlyAdopters.length) {
    console.log("No new early adopters to add");
    return res.status(200).json({ success: true });
  }

  const result = await prisma.cTAs.createMany({
    data: earlyAdopters.map((user) => ({
      type: "JOIN_PROGRAM" as CTAType,
      userId: user.id,
      isCompleted: true,
    })),
  });

  console.log(`Created JOIN_PROGRAM for ${result.count} users`);

  return res.status(200).json({ success: true, result: result.count });
}
