import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";

import { bigNumberToNumber, getAllowedChains } from "@/lib/utils";
import { getBalance } from "@/utils";

export interface KVBalanceResponse {
  balance: {
    polygonBalance: string;
    ethereumBalance: string;
    celoBalance: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "invalid method",
    });
  }

  const { address } = req.query;
  const KEY = `balance-${address}`;

  if (typeof address !== "string") {
    return res.status(405).json({
      message: "invalid req",
    });
  }

  const balanceFromKv = await kv.hget(KEY, "balance");
  if (balanceFromKv) {
    return res.status(200).json({
      balance: balanceFromKv as KVBalanceResponse,
    });
  }

  const chains = getAllowedChains();
  const DECIMALS = 18;
  const polygonBalance = bigNumberToNumber(
    await getBalance(address as string, chains[0].id),
    DECIMALS
  );
  const ethereumBalance = bigNumberToNumber(
    await getBalance(address as string, chains[1].id),
    DECIMALS
  );
  const celoBalance = bigNumberToNumber(
    await getBalance(address as string, chains[2].id),
    DECIMALS
  );

  const balance = {
    polygonBalance,
    ethereumBalance,
    celoBalance,
  };

  await kv.hset(KEY, {
    balance,
  });

  await kv.expire(KEY, 60 * 5); // 5 mins

  return res.status(200).json({ balance });
}
