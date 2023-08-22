import { celo, celoAlfajores } from "@wagmi/core/chains";
import axios from "axios";

import { getFirstGloBlock, getSmartContractAddress } from "./config";
import { isProd } from "./utils";

const chainAlias = isProd() ? "mainnet" : "alfajores";
const chainId = isProd() ? celo.id : celoAlfajores.id;
const GLO_ADDRESS = getSmartContractAddress(chainId);
const FIRST_BLOCK = getFirstGloBlock(chainId);

const instance = axios.create({
  baseURL: `https://explorer.celo.org/${chainAlias}/api`,
  headers: {
    accept: "application/json",
  },
});

export type TokenTransfer = {
  blockHash: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  from: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string;
  input: string;
  nonce: string;
  timeStamp: string;
  to: string;
  tokenDecimal: string;
  tokenID: string;
  tokenName: string;
  tokenSymbol: string;
  transactionIndex: string;
  value: string;
  // add blockTimestamp for compatibility with Erc20Transaction from Moralis
  blockTimestamp?: Date;
};

/*
E.g.
curl -X GET "https://explorer.celo.org/mainnet/api?module=account&action=tokentx&address=0xa76d7873b01fa564ec3e49a651c2e6e40dfa311f&contractaddress=0x4f604735c1cf31399c6e711d5962b2b3e0225ad3&start_block=20910330" -H "accept: application/json"
*/

//
export const fetchCeloTransactions = async (
  address: string,
  page?: number,
  offset?: number
): Promise<TokenTransfer[]> => {
  if ((page !== undefined && !offset) || (page === undefined && offset)) {
    throw new Error(
      "Either specify `page` and `offset` together or neither one"
    );
  }
  const transfers = await instance.get(
    `?module=account&action=tokentx&address=${address}&contract_addresses=${GLO_ADDRESS}&start_block=${FIRST_BLOCK}` +
      (page ? `&page=${page}` : "") +
      (offset ? `&offset=${offset}` : "")
  );

  const { status, result } = transfers.data;
  return status === "1" ? result : [];
};
