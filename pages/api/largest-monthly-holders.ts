import { NextApiRequest, NextApiResponse } from "next";

import { getLargestMonthlyHolders } from "@/lib/bitQuery";
import * as cache from "@/lib/cache";

const CACHE_KEY = "largest-monthly-holders";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const rows = await cache.cachedOrFetch(CACHE_KEY, async () => {
    return await getLargestMonthlyHolders("eth");
  });

  return res.status(200).json(rows);
}
