import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../lib/prisma";

const getOrCreate = async (address: string) => {
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        address,
      },
      select: { email },
    });
    return user?.email || "";
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
  const email = await getOrCreate(address);

  return res.status(200).json(email);
}
