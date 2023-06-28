import { NextApiRequest, NextApiResponse } from "next";

import { DEFAULT_CTAS } from "@/lib/utils";

import prisma from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["glo-pub-address"] as string;

  const { ctas } = await prisma.user.findFirstOrThrow({
    where: {
      address,
    },
    select: {
      ctas: {
        select: {
          type: true,
          isCompleted: true,
        },
      },
    },
  });

  const userCTAS = ctas.map((x) => x.type);

  return res
    .status(200)
    .json([
      ...DEFAULT_CTAS.filter((cta) => !userCTAS.includes(cta.type)),
      ...ctas,
    ]);
}
