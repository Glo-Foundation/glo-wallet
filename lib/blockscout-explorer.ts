import { Operation } from "@stellar/stellar-sdk";
import { celo, celoAlfajores, Chain, vechain } from "@wagmi/core/chains";
import axios from "axios";

import { getChainBlockNumber, getStellarTxs } from "@/lib/balance";

import { chainConfig, getSmartContractAddress } from "./config";
import { getMarketCap, getStellarMarketCap, isProd } from "./utils";

const chainId = isProd() ? celo.id : celoAlfajores.id;
const GLO_ADDRESS = getSmartContractAddress(chainId);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const instances: any = {
  polygon: `https://polygon.blockscout.com/api`,
  optimism: `https://optimism.blockscout.com/api`,
  arbitrum: `https://arbitrum.blockscout.com/api`,
  ethereum: `https://eth.blockscout.com/api`,
  celo: `https://celo.blockscout.com/api`,
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

  const transfers = await instance.get(
    `${queryString}&apikey=${process.env.BLOCKSCOUT_API_KEY}`
  );

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
    // TODO: Temp skip avg market cap
    const currentMarketCap = await getMarketCap(chain.id);
    return currentMarketCap;
    const zero =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    const topic = // sha3('Transfer(address,address,uint256)') => topic
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    const mintTopic = `&topic1=${zero}&topic0_1_opr=or`;
    const burnTopic = `&topic2=${zero}&topic0_2_opr=or`;
    const topics = `&topic0=${topic}${mintTopic}${burnTopic}&topic1_2_opr=or`;
    const res = await instance.get(
      `?module=logs&action=getLogs&fromBlock=${startBlock}&toBlock=${latestBlock}&address=${GLO_ADDRESS}${topics}&apikey=${process.env.BLOCKSCOUT_API_KEY}`
    );
    const data = res.data.result;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const operations: Operations[] = data.map((x: any) => ({
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

    // const currentMarketCap = await getMarketCap(chain.id);
    const endOfMonthMarketCap = endToLatestOps.reduce(
      (acc, cur) => (cur.isMint ? acc - cur.value : acc + cur.value),
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
    return BigInt(0);
  }
};

export const getAvgStellarMarketCap = async (
  startDate: Date,
  endDate: Date = new Date()
) => {
  const issuer = "GBBS25EGYQPGEZCGCFBKG4OAGFXU6DSOQBGTHELLJT3HZXZJ34HWS6XV";
  const res = await getStellarTxs(issuer, startDate);

  const ops: Operations[] = res.reverse().map(([date, x, seq]) => ({
    value: BigInt((x[0] as Operation.Payment).amount.replace(".", "")),
    ts: date,
    blockNumber: parseInt(seq),
    isMint: x[0].destination !== issuer,
  }));

  const endDateIndex = ops.findIndex((x) => x.ts >= endDate);

  const endToLatestOps = endDateIndex >= 0 ? ops.splice(endDateIndex) : [];

  const currentMarketCap = await getStellarMarketCap();

  const endOfMonthMarketCap = endToLatestOps.reduce(
    (acc, cur) => (cur.isMint ? acc - cur.value : acc + cur.value),
    BigInt(currentMarketCap) * BigInt(10 ** 7)
  );

  const avgBalance = await getAverage(
    startDate,
    endDate,
    endOfMonthMarketCap,
    ops.reverse()
  );

  return avgBalance;
};

const getAverage = async (
  startDate: Date,
  endDate: Date,
  endBalance: bigint,
  operations: Operations[]
): Promise<bigint> => {
  const milisecondsInMonthString = endDate.valueOf() - startDate.valueOf();
  const milisecondsInMonth = BigInt(milisecondsInMonthString.toString());
  let totalBalance = BigInt("0");
  let currentDate = endDate;
  let currentBalance = endBalance;

  operations.forEach((op) => {
    const balanceTime = BigInt(
      (currentDate.valueOf() - op.ts.valueOf()).toString()
    );
    const weightedBalance = currentBalance * balanceTime;
    totalBalance = totalBalance + weightedBalance;
    currentDate = op.ts;
    currentBalance = op.isMint
      ? currentBalance - op.value
      : currentBalance + op.value;
  });
  const balanceTime = currentDate.valueOf() - startDate.valueOf();
  const weightedBalance = currentBalance * BigInt(balanceTime);
  totalBalance = totalBalance + weightedBalance;

  const averageBalance = totalBalance / milisecondsInMonth;

  return averageBalance;
};
