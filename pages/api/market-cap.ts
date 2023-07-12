import { mainnet, polygon } from "@wagmi/core/chains";
import { BigNumber, utils } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

import * as cache from "@/lib/cache";
import { getMarketCap } from "@/lib/utils";

const CACHE_KEY = "market-cap";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const cached = cache.get(CACHE_KEY);

  if (cached) {
    return res.status(200).json(Number(cached));
  }

  const result = await Promise.all([
    getMarketCap(mainnet.id),
    getMarketCap(polygon.id),
  ]);

  const totalMarketCap = result.reduce(
    (acc, cur) => acc.add(cur),
    BigNumber.from(0)
  );

  // Add formatting
  const value = utils.formatEther(totalMarketCap).split(".")[0];

  cache.set(CACHE_KEY, value, 5 * 60);

  return res.status(200).json(Number(value));
}
