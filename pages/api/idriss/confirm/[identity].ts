import { NextApiRequest, NextApiResponse } from "next";

import { idriss } from "@/lib/idriss";
import prisma from "lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["glo-pub-address"] as string;
  const { identity } = req.query;

  if (typeof identity !== "string") {
    return res.status(405).json({
      message: "invalid req",
    });
  }
  const result = await idriss.resolve(identity);

  if (!Object.values(result).includes(address)) {
    return res.status(200).json({});
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
    type: "REGISTER_IDRISS" as CTAType,
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
