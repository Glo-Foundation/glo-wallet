import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../lib/prisma";

const DEFAULT_CTAS: CTA[] = ["SHARE_GLO", "BUY_GLO_MERCH", "JOIN_PROGRAM"].map(
  (cta) => ({ type: cta } as CTA)
);

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
        },
      },
    },
  });

  const userCTAS = ctas.map((x) => x.type);

  return res
    .status(200)
    .json([
      ...ctas,
      ...DEFAULT_CTAS.filter((cta) => !userCTAS.includes(cta.type)),
    ]);
}
