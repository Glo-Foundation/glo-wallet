import { NextApiRequest, NextApiResponse } from "next";

import prisma from "lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["glo-pub-address"] as string;

  if (!address) {
    return res.status(405).json({
      message: "invalid req",
    });
  }

  const user = await prisma.user.findFirstOrThrow({
    where: {
      address,
    },
    select: {
      id: true,
    },
  });

  const props = {
    type: "ADD_BETTERSWAP_LIQUIDITY" as CTAType,
    userId: user.id,
    isCompleted: true,
  };

  const cta = await prisma.cTAs.findFirst({
    where: props,
  });

  if (!cta) {
    await prisma.cTAs.create({
      data: props,
    });
  }

  return res.status(200).json({});
}
