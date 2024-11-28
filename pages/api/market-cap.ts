import {
  mainnet,
  polygon,
  celo,
  optimism,
  base,
  arbitrum,
} from "@wagmi/core/chains";
import { formatEther } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

import * as cache from "@/lib/cache";
import { getMarketCap } from "@/lib/utils";
import { getNiceNumber } from "@/utils";

const CACHE_KEY = "market-cap";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const cached = cache.get(CACHE_KEY);

  if (cached) {
    return res.status(200).end(cached);
  }

  const result = await Promise.all([
    getMarketCap(mainnet.id),
    getMarketCap(polygon.id),
    getMarketCap(celo.id),
    getMarketCap(optimism.id),
    getMarketCap(base.id),
    getMarketCap(arbitrum.id),
  ]);

  const totalMarketCap = result.reduce((acc, cur) => acc + cur, BigInt(0));

  const value = formatEther(totalMarketCap).split(".")[0];
  const formatted = getNiceNumber(Number(value));

  cache.set(CACHE_KEY, formatted, 5 * 60);

  return res.status(200).end(formatted);
}
