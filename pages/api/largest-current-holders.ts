import { NextApiRequest, NextApiResponse } from "next";

import * as cache from "@/lib/cache";
import { fetchLargestHolder } from "@/lib/dune";

const CACHE_KEY = "largest-current-holders-";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const network = _req?.query["network"];

  const rows = await cache.cachedOrFetch(CACHE_KEY + network, async () => {
    return await fetchLargestHolder(network as string);
  });

  return res.status(200).json(rows);
}
