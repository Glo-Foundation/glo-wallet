import { Chain } from "@wagmi/core";
import { celo, celoAlfajores, vechain } from "@wagmi/core/chains";
import axios from "axios";

import { getChainBlockNumber } from "@/lib/balance";

import {
  chainConfig,
  getFirstGloBlock,
  getSmartContractAddress,
} from "./config";
import { isProd } from "./utils";

const chainAlias = isProd() ? "mainnet" : "alfajores";
const chainId = isProd() ? celo.id : celoAlfajores.id;
const GLO_ADDRESS = getSmartContractAddress(chainId);
const FIRST_BLOCK = getFirstGloBlock(chainId);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const instances: any = {
  polygon: `https://polygon.blockscout.com/api`,
  optimism: `https://optimism.blockscout.com/api`,
  arbitrum: `https://arbitrum.blockscout.com/api`,
  ethereum: `https://eth.blockscout.com/api`,
  celo: `https://explorer.celo.org/mainnet/api`,
  base: `https://base.blockscout.com/api`,
};

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

export const fetchGloTransactions = async (
  address: string,
  chain: Chain,
  chainName: string,
  fromDate: Date,
  toDate: Date,
  page?: number,
  offset?: number
): Promise<TokenTransfer[]> => {
  if ((page !== undefined && !offset) || (page === undefined && offset)) {
    throw new Error(
      "Either specify `page` and `offset` together or neither one"
    );
  }

  const instance = axios.create({
    baseURL: instances[chainName],
    headers: {
      accept: "application/json",
    },
  });

  const startBlock = await getChainBlockNumber(fromDate, chain);
  const endBlock = await getChainBlockNumber(toDate, chain);

  if (chain.name.toLowerCase() === "vechain") {
    return await getVeTransactions(address, startBlock, endBlock);
  }

  let queryString =
    `?module=account&action=tokentx&address=${address}&contractaddress=${GLO_ADDRESS}&startblock=${startBlock}&endblock=${endBlock}` +
    (page ? `&page=${page}` : "") +
    (offset ? `&offset=${offset}` : "");

  if (chain.name.toLowerCase() === "celo") {
    queryString =
      `?module=account&action=tokentx&address=${address}&contractaddress=${GLO_ADDRESS}&start_block=${startBlock}&end_block=${endBlock}` +
      (page ? `&page=${page}` : "") +
      (offset ? `&offset=${offset}` : "");
  }

  const transfers = await instance.get(queryString);

  const { status, result } = transfers.data;

  return status === "1" ? result : [];
};

type RawEvent = {
  _value: string;
  _to: string;
  _from: string;
  _meta: {
    blockNumber: number;
    blockTimestamp: number;
  };
};
const getVeTransactions = async (
  rawAddress: string,
  startBlock: number,
  endBlock: number
) => {
  const address = rawAddress.slice(2);
  const base = {
    address: chainConfig[vechain.id],
    signature:
      "Transfer (address indexed _from, address indexed _to, uint256 _value)",
  };
  const records: TokenTransfer[] = [];
  let offset = 0;

  while (true) {
    try {
      const res = await axios.post("https://event.api.vechain.energy/main", {
        events: [
          {
            ...base,
            _from: address,
          },
          {
            ...base,
            _to: address,
          },
        ],
        unit: "block",
        from: startBlock,
        to: endBlock,
        limit: 500,
        offset,
        order: "desc",
      });

      records.push(
        ...res.data
          .filter((x: RawEvent) => x._value != "0")
          .map(
            (x: RawEvent) =>
              ({
                value: x._value,
                to: x._to,
                from: x._from,
                blockNumber: x._meta.blockNumber.toString(),
                timeStamp: x._meta.blockTimestamp.toString(),
              } as TokenTransfer)
          )
      );

      if (res.data.length < 500) {
        break;
      }

      offset += 500;
    } catch (err) {
      console.log({ err });
      return [];
    }
  }

  return records;
};
