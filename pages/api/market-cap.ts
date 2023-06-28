import { polygon } from "@wagmi/core/chains";
import { NextApiRequest, NextApiResponse } from "next";

import { getSmartContractAddress } from "@/lib/config";

const getMarketCap = async (url: string, regex: RegExp) => {
  try {
    const result = await fetch(url, {
      next: {
        revalidate: 5 * 60, // 5 minutes
      },
    });
    const text = await result.text();
    const matches = text.match(regex);

    return matches ? Number(matches[0].split("'")[1].replace(", ", "")) : 0;
  } catch (err) {
    console.error(err);
    console.log(`Could not fetch market cap - ${url} - ${regex}`);
    return 0;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const USDGLO_POLYGON_CONTRACT_ADDRESS = getSmartContractAddress(polygon.id);
  const result = await Promise.all([
    getMarketCap(
      `https://polygonscan.com/token/${USDGLO_POLYGON_CONTRACT_ADDRESS}`,
      /title=\'\d+\, \d+/g
    ),
    getMarketCap(
      `https://etherscan.io/token/${USDGLO_POLYGON_CONTRACT_ADDRESS}`,
      /title=\'\d+\, \d+/g
    ),
  ]);

  const totalMarketCap = result.reduce((acc, cur) => acc + cur, 0);

  return res.status(200).json(totalMarketCap);
}
