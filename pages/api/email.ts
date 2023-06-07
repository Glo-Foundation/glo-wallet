import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["glo-pub-address"] as string;
  const user = await prisma.user.findFirst({
    where: {
      address,
    },
    select: {
      email: true,
    },
  });
  return res.status(200).json(user?.email || "");
}
