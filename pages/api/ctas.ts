import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../lib/prisma";

const DEFAULT_ACTIONS: CTA[] = [
  "SHARE_GLO",
  "BUY_GLO_MERCH",
  "JOIN_PROGRAM",
].map((cta) => ({ type: cta } as CTA));

const getOrCreate = async (address: string) => {
  try {
    const user = await prisma.user.findFirstOrThrow({
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
    return user?.ctas || [];
  } catch {
    await prisma.user.create({
      data: {
        address,
      },
    });

    return [];
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["glo-pub-address"] as string;

  const ctas = await getOrCreate(address);

  const userCTAS = ctas.map((x) => x.type);

  return res
    .status(200)
    .json([
      ...ctas,
      ...DEFAULT_ACTIONS.filter((cta) => !userCTAS.includes(cta.type)),
    ]);
}
