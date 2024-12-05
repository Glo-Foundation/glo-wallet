import { NextApiRequest, NextApiResponse } from "next";

import * as cache from "@/lib/cache";
import { fetchLeaderboardForMonth } from "@/lib/dune";

const CACHE_KEY = "largest-monthly-holders";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const cached = cache.get(CACHE_KEY);

  if (cached) {
    const json = JSON.parse(cached);
    return res.status(200).json(json);
  }

  const rows = await fetchLeaderboardForMonth();

  // The dune query is executed on the daily basis
  cache.set(CACHE_KEY, JSON.stringify(rows), 60 * 60);

  return res.status(200).json(rows);
}
