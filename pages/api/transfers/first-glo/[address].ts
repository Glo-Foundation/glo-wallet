import { kv } from "@vercel/kv";
import Moralis from "moralis";
import { Erc20Transaction, EvmAddress } from "moralis/common-evm-utils";
import { NextApiRequest, NextApiResponse } from "next";

import { getFirstGloBlock, chainConfig, supportedChains } from "@/lib/config";
import { isProd } from "@/lib/utils";

export interface KVResponse {
  dateFirstGlo: string;
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

  if (typeof address !== "string") {
    return res.status(405).json({
      message: "invalid req",
    });
  }

  const valueFromKv = (await kv.get(address)) as string;
  if (valueFromKv) {
    if (valueFromKv === "cache") {
      return res.status(200).json({
        dateFirstGlo: null,
      });
    }

    const dateFirstGlo: Date = new Date(valueFromKv);
    return res.status(200).json({
      dateFirstGlo,
    });
  }

  const chains = isProd() ? supportedChains.mainnet : supportedChains.testnet;

  const transactions: { [id: number]: Erc20Transaction | null } = {};

  for (const chain of chains) {
    transactions[chain] = await fetchFirstGloTransaction(address, chain);
  }

  const timeStamps = Object.values(transactions).map(
    (tx) => tx?.blockTimestamp
  );

  const dateFirstGlo = getEarliest(timeStamps);
  if (dateFirstGlo) {
    await kv.set(address, new Date(dateFirstGlo).toISOString());
  } else {
    await kv.set(address, "cache", { ex: 60 * 60 * 24 });
  }

  return res.status(200).json({
    dateFirstGlo,
  });
}

// fetch very first Glo transaction
export const fetchFirstGloTransaction = async (
  address: string,
  chain: number
): Promise<Erc20Transaction | null> => {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
  }

  // find first minting transaction
  const mintingTxs = await findMintingTxs(chain, address);

  // find all incoming transactions
  let cursor = null;
  let incomingGloTxs: Erc20Transaction[] = [];

  do {
    const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
      address,
      chain,
      fromBlock: getFirstGloBlock(chain),
      cursor: cursor ? cursor : undefined,
      limit: 100,
    });

    const incomingGloTxs_ = response.result.filter((tx: Erc20Transaction) => {
      return (
        tx.toAddress.equals(address.toLowerCase()) &&
        tx.contractAddress.equals(chainConfig[chain].toLowerCase())
      );
    });

    incomingGloTxs = incomingGloTxs.concat(incomingGloTxs_);

    cursor = response.pagination.cursor as string;
  } while (cursor != null);

  if (incomingGloTxs.length === 0 && !mintingTxs) {
    return null;
  }

  const allTxs = mintingTxs
    ? incomingGloTxs.concat(mintingTxs!)
    : incomingGloTxs;
  const allTxsInOrder = allTxs.sort();

  return allTxsInOrder[0];
};

async function findMintingTxs(
  chain: number,
  address: string
): Promise<Erc20Transaction[] | null> {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
  }
  let cursor = null;
  let mintingTxs: Erc20Transaction[] = [];
  do {
    const response = await Moralis.EvmApi.token.getTokenTransfers({
      chain,
      address: chainConfig[chain],
      fromBlock: getFirstGloBlock(chain),
      cursor: cursor ? cursor : undefined,
      limit: 100,
    });

    const txs = response.result.filter((tx: Erc20Transaction) => {
      return (
        tx.result.fromAddress.equals(EvmAddress.ZERO_ADDRESS) &&
        tx.result.toAddress.lowercase === address.toLowerCase()
      );
    });

    mintingTxs = mintingTxs.concat(txs);

    cursor = response.pagination.cursor as string;
  } while (cursor != null);

  if (mintingTxs.length > 0) {
    return mintingTxs;
  } else {
    return null;
  }
}

const getEarliest = (timeStamps: (Date | undefined)[]) => {
  return timeStamps.reduce((a, b) => {
    if (!a) {
      return b;
    }

    if (!b) {
      return a;
    }

    return a < b ? a : b;
  });
};
