import { mainnet, polygon, celo } from "@wagmi/core/chains";
import { BigNumber, utils } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

import * as cache from "@/lib/cache";
import { getCMCMarketCap } from "@/lib/utils";
import { getNiceNumber } from "@/utils";

const CACHE_KEY = "stablecoin-market-caps";
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const cached = cache.get(CACHE_KEY);

  if (cached) {
    return res.status(200).end(cached);
  }

  const result = await getCMCMarketCap();

  const allMarketCaps = Object.entries(result).map((stable) => ({
    name: stable[1].symbol,
    supply: stable[1].circulating_supply
      ? stable[1].circulating_supply
      : stable[1].total_supply,
  }));

  const stringMarketCaps = JSON.stringify(allMarketCaps);

  // const totalMarketCaps = allMarketCaps.reduce( (acc, cur) => acc + cur.supply, 0);

  // const formatted = getNiceNumber(totalMarketCaps);

  cache.set(CACHE_KEY, stringMarketCaps, 60 * 60);

  return res.status(200).end(stringMarketCaps);
}
