import { NextApiRequest, NextApiResponse } from "next";

import * as cache from "@/lib/cache";
import { fetchTotalHolders } from "@/lib/dune";

const CACHE_KEY = "total-holders";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const total = await cache.cachedOrFetch(CACHE_KEY, fetchTotalHolders);

  return res.status(200).end(total);
}
