import { NextApiRequest, NextApiResponse } from "next";

import * as cache from "@/lib/cache";
import { fetchTotalTransactions } from "@/lib/dune";

const CACHE_KEY = "total-transactions";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const total = await cache.cachedOrFetch(CACHE_KEY, fetchTotalTransactions);

  return res.status(200).end(total);
}
