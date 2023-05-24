import { ActionType } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../lib/prisma";

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
    const user = await prisma.user.create({
      data: {
        address,
      },
    });

    const actionsData = Object.keys(ActionType).map((action) => ({
      type: action as ActionType,
      userId: user.id,
    }));

    await prisma.actions.createMany({
      data: actionsData,
    });

    return actionsData;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.headers["glo-pub-address"] as string;

  const actions = await getOrCreate(address);

  return res.status(200).json(actions);
}
