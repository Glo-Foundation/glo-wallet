import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const yesterday = await prisma.celoLiquidity.findFirst({
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
  const firstDayOfLastMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );

  const firstDayOfThisMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
  const lastMonthRecords = await prisma.celoLiquidity.findMany({
    select: {
      total: true,
      breakdown: true,
    },
    where: {
      createdAt: {
        // >= Last month 1st day
        gte: firstDayOfLastMonth,
        // < First day of this month
        lt: firstDayOfThisMonth,
      },
    },
  });

  const thisMonthRecords = await prisma.celoLiquidity.findMany({
    select: {
      total: true,
      breakdown: true,
    },
    where: {
      createdAt: {
        gte: firstDayOfThisMonth,
      },
    },
  });

  const calc = (
    records: {
      total: number;
      breakdown: Prisma.JsonValue;
    }[],
    days: number
  ) => {
    const breakdownEntries: { [key: string]: number[] } = {};
    let total = 0;

    records.forEach((record) => {
      total += record.total;
      Object.entries(record.breakdown || {}).forEach(([key, value]) => {
        if (!breakdownEntries[key]) {
          breakdownEntries[key] = [];
        }
        breakdownEntries[key].push(value);
      });
    });

    total /= days;

    const breakdown = Object.entries(breakdownEntries).reduce(
      (res, [key, values]) => ({
        ...res,
        [key]: Math.round(values.reduce((acc, cur) => acc + cur, 0) / days),
      }),
      {}
    );

    return {
      avgTotal: Math.round(total),
      breakdown,
    };
  };

  const daysLastMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    0
  ).getDate();
  return res.status(200).json({
    yesterday,
    [firstDayOfLastMonth.toLocaleString("default", { month: "long" })]: {
      ...calc(lastMonthRecords, daysLastMonth),
    },
    [firstDayOfThisMonth.toLocaleString("default", { month: "long" })]:
      thisMonthRecords.length > 0
        ? {
            ...calc(thisMonthRecords, today.getDate()),
          }
        : {},
  });
}
