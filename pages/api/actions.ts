import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["Glo-pub-address"] as string;

  const user = await prisma.user.findFirst({
    where: {
      address,
    },
    select: {
      actions: {
        select: {
          type: true,
        },
      },
    },
  });

  return res.status(200).json(user?.actions || []);
}
