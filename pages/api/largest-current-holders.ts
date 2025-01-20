import { NextApiRequest, NextApiResponse } from "next";

import * as cache from "@/lib/cache";
import { fetchLargestHolder } from "@/lib/dune";

const CACHE_KEY = "largest-current-holders";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const rows = await cache.cachedOrFetch(CACHE_KEY, fetchLargestHolder);

  return res.status(200).json(rows);
}
