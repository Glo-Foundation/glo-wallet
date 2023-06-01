import { NextApiRequest, NextApiResponse } from "next";

import { fetchTransactions } from "@/lib/moralis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chain } = req.query;
  const address = req.headers["glo-pub-address"] as string;

  if (typeof address !== "string" || typeof chain !== "string") {
    return res.status(405).json({
      message: "invalid req",
    });
  }

  const chainHex = `0x${parseInt(chain).toString(16)}`;
  console.log({ chainHex });
  const transactions = await fetchTransactions(address, chainHex);
  console.log({ transactions });

  return res.status(200).json(transactions);
}
