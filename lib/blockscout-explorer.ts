import { Chain } from "@wagmi/core";
import { celo, celoAlfajores } from "@wagmi/core/chains";
import axios from "axios";
import { BigNumber } from "ethers";

import { getChainBlockNumber } from "@/lib/balance";

import { getSmartContractAddress } from "./config";
import { getMarketCap, isProd } from "./utils";

const chainId = isProd() ? celo.id : celoAlfajores.id;
const GLO_ADDRESS = getSmartContractAddress(chainId);

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
  chainName;
  const startBlock = await getChainBlockNumber(fromDate, chain);
  const endBlock = await getChainBlockNumber(toDate, chain);

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

type Operations = {
  value: bigint;
  ts: Date;
  blockNumber: number;
  isMint: boolean;
};

export const getAvgMarketCap = async (
  chain: Chain,
  chainName: string,
  startDate: Date,
  endDate: Date
) => {
  const startBlock = await getChainBlockNumber(startDate, chain);
  const endBlock = await getChainBlockNumber(endDate, chain);
  const latestBlock = await getChainBlockNumber(new Date(), chain);

  const instance = axios.create({
    baseURL: instances[chainName],
    headers: {
      accept: "application/json",
    },
  });

  try {
    const zero =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    const topic = // sha3('Transfer(address,address,uint256)') => topic
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    const mintTopic = `&topic1=${zero}&topic0_1_opr=or`;
    const burnTopic = `&topic2=${zero}&topic0_2_opr=or`;
    const topics = `&topic0=${topic}${mintTopic}${burnTopic}&topic1_2_opr=or`;
    const res = await instance.get(
      `?module=logs&action=getLogs&fromBlock=${startBlock}&toBlock=${latestBlock}&address=${GLO_ADDRESS}${topics}`
    );
    const data = res.data.result;

    const operations: Operations[] = data.map((x) => ({
      value: BigInt(x.data),
      ts: new Date(parseInt(x.timeStamp, 16) * 1000),
      blockNumber: parseInt(x.blockNumber, 16),
      isMint: x.topics[1] === zero,
    }));

    const endBlockIndex = operations.findIndex(
      (x) => x.blockNumber >= endBlock
    );

    const endToLatestOps =
      endBlockIndex >= 0 ? operations.splice(endBlockIndex) : [];

    const currentMarketCap = await getMarketCap(chain.id);
    const endOfMonthMarketCap = endToLatestOps.reduce(
      (acc, cur) => (cur.isMint ? acc.sub(cur.value) : acc.add(cur.value)),
      currentMarketCap
    );
    const avgBalance = await getAverage(
      startDate,
      endDate,
      endOfMonthMarketCap,
      operations.reverse()
    );

    return avgBalance;
  } catch (err) {
    console.log({ err });
    return BigNumber.from(0);
  }
};

const getAverage = async (
  startDate: Date,
  endDate: Date,
  endBalance: BigNumber,
  operations: Operations[]
): Promise<BigNumber> => {
  const milisecondsInMonthString = endDate.valueOf() - startDate.valueOf();
  const milisecondsInMonth = BigNumber.from(
    milisecondsInMonthString.toString()
  );
  let totalBalance = BigNumber.from("0");
  let currentDate = endDate;
  let currentBalance = endBalance;

  operations.forEach((op) => {
    const balanceTime = BigNumber.from(
      (currentDate.valueOf() - op.ts.valueOf()).toString()
    );
    const weightedBalance = currentBalance.mul(balanceTime);
    totalBalance = totalBalance.add(weightedBalance);
    currentDate = op.ts;
    currentBalance = op.isMint
      ? currentBalance.sub(op.value)
      : currentBalance.add(op.value);
  });
  const balanceTime = currentDate.valueOf() - startDate.valueOf();
  const weightedBalance = currentBalance.mul(BigNumber.from(balanceTime));
  totalBalance = totalBalance.add(weightedBalance);

  const averageBalance = totalBalance.div(milisecondsInMonth);

  return averageBalance;
};
