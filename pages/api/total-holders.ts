import { NextApiRequest, NextApiResponse } from "next";

import * as cache from "@/lib/cache";

const CACHE_KEY = "total-holders";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const cached = cache.get(CACHE_KEY);

  if (cached) {
    return res.status(200).end(cached);
  }

  // Fetch total holders number from Dune
  const total = String(123);

  cache.set(CACHE_KEY, total, 5 * 60);

  return res.status(200).end(total);
}
