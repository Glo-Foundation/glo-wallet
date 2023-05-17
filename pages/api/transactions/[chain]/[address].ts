import { NextApiRequest, NextApiResponse } from "next";

import { fetchTransactions } from "@/lib/moralis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chain, address } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({
      message: "method not supported",
    });
  }

  if (typeof address !== "string" || typeof chain !== "string") {
    return res.status(405).json({
      message: "invalid req",
    });
  }

  const chainHex = `0x${parseInt(chain).toString(16)}`;
  const transactions = await fetchTransactions(address, chainHex);

  return res.status(200).json({ transactions });
}
