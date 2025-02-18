import { NextApiRequest, NextApiResponse } from "next";

import { INetworks } from "@/components/Info/types";
import * as cache from "@/lib/cache";
import { fetchLargestHoldersForPastMonth } from "@/lib/dune";

const CACHE_KEY = "largest-monthly-holders-";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const network = _req?.query["network"];

  const rows = await cache.cachedOrFetch(CACHE_KEY + network, async () => {
    return await fetchLargestHoldersForPastMonth(network as INetworks);
  });

  return res.status(200).json(rows);
}
