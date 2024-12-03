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

  if (cached && !Object.keys(_req.query).includes("reset")) {
    return res.status(200).end(cached);
  }

  const stablecoin_colors: { [key: string]: string } = {
    USDGLO: "#24e5df",
    USDT: "#009393",
    USDC: "#2775ca",
    FDUSD: "#00d680",
    TUSD: "#1a5bff",
    USDP: "#00a650",
    PYUSD: "#0070e0",
    GUSD: "#26ddf9",
    ZUSD: "#d62825",
    USDV: "#000000",
    USDM: "#000000",
  };

  const result = await getCMCMarketCap();

  const allMarketCaps = Object.entries(result).map((stable) => ({
    name: stable[1].symbol,
    supply: stable[1].circulating_supply
      ? stable[1].circulating_supply
      : stable[1].total_supply,
    cap: stable[1].circulating_supply
      ? getNiceNumber(Number(stable[1].circulating_supply))
      : getNiceNumber(Number(stable[1].total_supply)),
    color: stablecoin_colors[stable[1].symbol],
  }));

  const stringMarketCaps = JSON.stringify(allMarketCaps);

  cache.set(CACHE_KEY, stringMarketCaps, 60 * 60);

  return res.status(200).end(stringMarketCaps);
}
