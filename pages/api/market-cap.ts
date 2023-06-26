import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

import { USDGLO_POLYGON_CONTRACT_ADDRESS } from "@/utils";

const getMarketCap = async (url: string, regex: RegExp) => {
  const result = await axios.get(url);

  try {
    const matches = result.data.match(regex);

    return Number(matches[0].split("$")[1].replace(",", ""));
  } catch (err) {
    console.log(`Could not fetch market cap - ${url} - ${regex}`);
    return 0;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await Promise.all([
    getMarketCap(
      `https://polygonscan.com/token/${USDGLO_POLYGON_CONTRACT_ADDRESS}`,
      /\$\d+\,\d+\.\d+/g
    ),
    getMarketCap(
      `https://etherscan.io/token/${USDGLO_POLYGON_CONTRACT_ADDRESS}`,
      /<div>\n\$\d+\,\d+\.\d+/g
    ),
  ]);

  const totalMarketCap = result.reduce((acc, cur) => acc + cur, 0);

  return res.status(200).json(totalMarketCap);
}
