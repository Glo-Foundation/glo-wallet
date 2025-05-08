import { NextApiRequest, NextApiResponse } from "next";

import { getCeloUniswapLpTVL, getDexData, getRefi, getUbeswap } from "@/lib/celo-data";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const authHeader = req.headers["authorization"];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const latest = await prisma.celoLiquidity.findFirst({
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (latest?.createdAt.toDateString() === new Date().toDateString()) {
    return res.status(200).json({ message: "Already collected for today." });
  }

  const { total: totalUniswap, details: uniswapLps } =
    await getCeloUniswapLpTVL();

  const ubeswap = await getUbeswap();
  const refi = await getRefi();
  const ubeswapGoodDollar = await getDexData();
  const total = totalUniswap + ubeswap + refi + ubeswapGoodDollar;

  await prisma.celoLiquidity.create({
    data: {
      total,
      breakdown: {
        ...uniswapLps,
        ubeswap,
        "ReFi Medellin": refi,
        "Ubeswap/G$": ubeswapGoodDollar
      },
    },
  });

  return res.status(200).json({ message: "Data collection completed." });
}
