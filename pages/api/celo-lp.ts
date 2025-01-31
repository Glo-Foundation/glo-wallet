import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const latest = await prisma.celoLiquidity.findFirst({
    select: {
      total: true,
      breakdown: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const today = new Date();
  const lastMonthRecords = await prisma.celoLiquidity.findMany({
    select: {
      total: true,
      breakdown: true,
    },
    where: {
      createdAt: {
        // >= Last month 1st day
        gte: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        // < First day of this month
        lt: new Date(today.getFullYear(), today.getMonth(), 1),
      },
    },
  });

  const breakdownEntries: { [key: string]: number[] } = {};
  let total = 0;
  const daysLastMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    0
  ).getDate();
  lastMonthRecords.forEach((record) => {
    total += record.total;
    Object.entries(record.breakdown || {}).forEach(([key, value]) => {
      if (!breakdownEntries[key]) {
        breakdownEntries[key] = [];
      }
      breakdownEntries[key].push(value);
    });
  });

  total /= daysLastMonth;

  const breakdown = Object.entries(breakdownEntries).reduce(
    (res, [key, values]) => ({
      ...res,
      [key]: Math.round(
        values.reduce((acc, cur) => acc + cur, 0) / daysLastMonth
      ),
    }),
    {}
  );

  return res.status(200).json({
    latest,
    lastMonth: {
      avgTotal: Math.round(total),
      breakdown,
    },
  });
}
