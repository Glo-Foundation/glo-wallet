import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../lib/prisma";

const DEFAULT_ACTIONS: Action[] = [
  "SHARE_GLO",
  "BUY_GLO_MERCH",
  "JOIN_PROGRAM",
].map((action) => ({ type: action } as Action));

const getOrCreate = async (address: string) => {
  try {
    const user = await prisma.user.findFirstOrThrow({
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
    return user?.actions || [];
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

  const actions = await getOrCreate(address);

  const userActions = actions.map((x) => x.type);

  return res
    .status(200)
    .json([
      ...actions,
      ...DEFAULT_ACTIONS.filter((action) => !userActions.includes(action.type)),
    ]);
}
