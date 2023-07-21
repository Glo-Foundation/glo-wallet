import axios from "axios";
import Moralis from "moralis";
import {
  Erc20Transaction,
  EvmAddress,
  EvmErc20TransferJSON,
  EvmErc20TransfersResponseJSON,
} from "moralis/common-evm-utils";

import { hexToNumber } from "@/utils";

import { getFirstGloBlock } from "./config";

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
  chainHex: string
): Promise<Erc20Transaction | null> => {
  let cursor = "";
  do {
    const response = await Moralis.EvmApi.token.getTokenTransfers({
      chain: chainHex,
      address: process.env.NEXT_PUBLIC_USDGLO as string,
      fromBlock: getFirstGloBlock(hexToNumber(chainHex)),
      cursor: cursor,
      limit: 100,
    });

    const firstTx = response.result.find((tx: Erc20Transaction) => {
      return (
        tx.result.fromAddress.equals(EvmAddress.ZERO_ADDRESS) &&
        tx.result.toAddress.lowercase === address.toLowerCase()
      );
    });

    if (firstTx) {
      return firstTx;
    }

    cursor = response.pagination.cursor as string;
  } while (cursor !== "" && cursor != null);

  return null;
};
