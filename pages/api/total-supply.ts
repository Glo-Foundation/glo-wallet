import {
  arbitrum,
  base,
  celo,
  mainnet,
  optimism,
  polygon,
  vechain,
} from "@wagmi/core/chains";
import { formatEther } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

import * as cache from "@/lib/cache";
import { getMarketCap, getStellarMarketCap } from "@/lib/utils";

const CACHE_KEY = "total-supply";
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
    getMarketCap(vechain.id),
  ]);

  const stellarMarketCap = await getStellarMarketCap();

  const totalEVMMarketCap = result.reduce((acc, cur) => acc + cur, BigInt(0));

  const EVMMarketCap = parseInt(formatEther(totalEVMMarketCap).split(".")[0]);

  const value = (EVMMarketCap + stellarMarketCap).toString();

  cache.set(CACHE_KEY, value, 5 * 60);

  return res.status(200).end(value);
}
