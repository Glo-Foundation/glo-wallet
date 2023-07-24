import axios from "axios";
import Moralis from "moralis";
import {
  Erc20Transaction,
  EvmAddress,
  EvmErc20TransferJSON,
  EvmErc20TransfersResponseJSON,
} from "moralis/common-evm-utils";

import { chainConfig, getFirstGloBlock } from "./config";

if (!Moralis.Core.isStarted) {
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
}

const instance = axios.create({
  baseURL: "https://deep-index.moralis.io/api/v2/",
  headers: {
    accept: "application/json",
    "X-API-Key": process.env.MORALIS_API_KEY,
  },
});

// https://docs.moralis.io/web3-data-api/reference/get-erc20-transfers
export const fetchTransactions = async (
  address: string,
  chainHex: string,
  cursor?: string,
  limit = 5
): Promise<TransfersPage> => {
  const transfers = await instance.get<EvmErc20TransfersResponseJSON>(
    `erc20/transfers?contract_addresses%5B0%5D=${process.env.NEXT_PUBLIC_USDGLO}&wallet_addresses%5B0%5D=${address}&chain=${chainHex}&limit=${limit}` +
      (cursor ? `&cursor=${cursor}` : "")
  );

  return {
    transfers:
      transfers.data.result?.map((tx: EvmErc20TransferJSON) => ({
        type:
          tx.from_wallet.toLowerCase() === address.toLowerCase()
            ? "outgoing"
            : "incoming",
        ts: tx.block_timestamp,
        from: tx.from_wallet,
        to: tx.to_wallet,
        value: tx.value_decimal,
        hash: tx.transaction_hash,
      })) || [],
    cursor: transfers.data.cursor,
  };
};

// fetch very first Glo transaction
export const fetchFirstGloTransaction = async (
  address: string,
  chain: number
): Promise<Erc20Transaction | null> => {
  // find first minting transaction
  const mintingTxs = await findMintingTxs(chain, address);

  // find all incoming transactions
  let cursor = "";
  let incomingGloTxs: Erc20Transaction[] = [];

  do {
    const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
      address,
      chain,
      fromBlock: getFirstGloBlock(chain),
      cursor: cursor,
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
  } while (cursor !== "" && cursor != null);

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
  let cursor = "";
  let mintingTxs: Erc20Transaction[] = [];
  do {
    const response = await Moralis.EvmApi.token.getTokenTransfers({
      chain,
      address: chainConfig[chain],
      fromBlock: getFirstGloBlock(chain),
      cursor: cursor,
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
  } while (cursor !== "" && cursor != null);

  if (mintingTxs.length > 0) {
    return mintingTxs;
  } else {
    return null;
  }
}
