import { NextApiRequest, NextApiResponse } from "next";

import { fetchTransactions } from "@/lib/moralis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({
      message: "method not supported",
    });
  }

  if (typeof address !== "string") {
    return res.status(405).json({
      message: "invalid req",
    });
  }

  const transactions = await fetchTransactions(address);

  return res.status(200).json({ transactions });
}
