import { kv } from "@vercel/kv";
import { celo, celoAlfajores } from "@wagmi/core/chains";
import Moralis from "moralis";
import { Erc20Transaction, EvmAddress } from "moralis/common-evm-utils";
import { NextApiRequest, NextApiResponse } from "next";

import { TokenTransfer, fetchCeloTransactions } from "@/lib/celo-explorer";
import { chainConfig, getFirstGloBlock, supportedChains } from "@/lib/config";
import { isProd } from "@/lib/utils";

export interface KVResponse {
  dateFirstGlo: string;
}

export type EVMTransaction = Erc20Transaction | TokenTransfer;

// coerce "compatibility" of Celo's TokenTransfer with Moralis' Erc20Transaction
function compat(tx: TokenTransfer): EVMTransaction {
  return {
    ...tx,
    blockTimestamp: new Date(Number(tx.timeStamp + "000")),
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

  const transactions: { [id: number]: EVMTransaction | null } = {};

  for (const chain of chains) {
    // Moralis doesn't support celo yet, handle manually
    if (chain === celo.id || chain === celoAlfajores.id) {
      const tx = await fetchFirstCeloGloTransaction(address);
      transactions[chain] = tx ? compat(tx) : null;
    } else {
      transactions[chain] = await fetchFirstGloTransaction(address, chain);
    }
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
const fetchFirstGloTransaction = async (
  address: string,
  chain: number
): Promise<Erc20Transaction | null> => {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
  }

  // find first minting transaction
  let mintingTxs: Erc20Transaction[] | null;
  try {
    mintingTxs = await findMintingTxs(chain, address);
  } catch (err) {
    // Invalid or not supported chain
    return null;
  }

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

const fetchFirstCeloGloTransaction = async (
  address: string
): Promise<TokenTransfer | null> => {
  // find all incoming (or minting) transactions
  let incomingTxs: TokenTransfer[] = [];
  let page = 0;

  // max num of records returned when paginating
  const OFFSET = 100;

  do {
    const response: TokenTransfer[] = await fetchCeloTransactions(
      address,
      page,
      OFFSET
    );

    const txs = response.filter(
      (tx: TokenTransfer) => tx.to.toLowerCase() === address.toLowerCase()
    );

    incomingTxs = incomingTxs.concat(txs);

    page += 1;

    // break if a page returned with less than expected page size
    if (response.length < OFFSET) break;
  } while (true);

  incomingTxs.sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));

  return incomingTxs[0];
};
