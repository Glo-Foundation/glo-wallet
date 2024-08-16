import { NextApiRequest, NextApiResponse } from "next";

import * as cache from "@/lib/cache";
import { fetchTotalTransactions } from "@/lib/dune";

const CACHE_KEY = "total-holders";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const cached = cache.get(CACHE_KEY);

  if (cached) {
    return res.status(200).end(cached);
  }

  const total = await fetchTotalTransactions();

  // The dune query is executed on the daily basis
  cache.set(CACHE_KEY, total, 60 * 60);

  return res.status(200).end(total);
}
