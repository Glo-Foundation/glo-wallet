import { kv } from "@vercel/kv";
import { Chain } from "@wagmi/core";
import {
  celo,
  celoAlfajores,
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
  optimism,
  optimismSepolia,
  arbitrum,
  arbitrumSepolia,
} from "@wagmi/core/chains";
import axios from "axios";
import { BigNumber } from "ethers";

import { TokenTransfer } from "@/lib/blockscout-explorer";
import { isProd } from "@/lib/utils";
import { getBalance, getBlockNumber } from "@/utils";
// import { EVMTransaction } from "@/pages/api/transfers/first-glo/[address]"

export const getBalances = async (address: string, onDate?: Date) => {
  let balance = 0;
  let [
    polygonBalance,
    ethereumBalance,
    celoBalance,
    optimismBalance,
    arbitrumBalance,
    stellarBalance,
  ] = [
    BigNumber.from("0"),
    BigNumber.from("0"),
    BigNumber.from("0"),
    BigNumber.from("0"),
    BigNumber.from("0"),
    BigNumber.from("0"),
  ];
  if (address.slice(0, 4).includes("0x")) {
    [
      polygonBalance,
      ethereumBalance,
      celoBalance,
      optimismBalance,
      arbitrumBalance,
    ] = await Promise.all([
      getChainBalance(address, isProd() ? polygon : polygonMumbai, onDate),
      getChainBalance(address, isProd() ? mainnet : goerli, onDate),
      getChainBalance(address, isProd() ? celo : celoAlfajores, onDate),
      getChainBalance(address, isProd() ? optimism : optimismSepolia, onDate),
      getChainBalance(address, isProd() ? arbitrum : arbitrumSepolia, onDate),
    ]);
    const decimals = BigInt(10 ** 18);
    balance = polygonBalance
      .add(ethereumBalance)
      .add(celoBalance)
      .add(arbitrumBalance)
      .add(optimismBalance)
      .div(decimals)
      .toNumber();
  } else {
    stellarBalance = await getStellarBalance(address);
    const decimals = BigInt(10 ** 7);
    balance = stellarBalance.div(decimals).toNumber();
  }

  return {
    totalBalance: balance,
    polygonBalance,
    ethereumBalance,
    celoBalance,
    optimismBalance,
    arbitrumBalance,
    stellarBalance,
  };
};

async function getChainBalance(
  address: string,
  chain: Chain,
  onDate?: Date
): Promise<BigNumber> {
  const chainName = chain.name.toLowerCase();
  const utcDate = onDate ? onDate.toJSON().substring(0, 10) : "";

  const cacheKey = `balance-${address}-${utcDate}`;
  const cacheValue = await kv.hget(cacheKey, chainName);

  let balance;

  if (!cacheValue) {
    if (onDate) {
      const blockNumber = await getChainBlockNumber(onDate, chain);
      balance = await getBalance(address as string, chain.id, blockNumber);
    } else {
      balance = await getBalance(address as string, chain.id);
    }

    await kv.hset(cacheKey, {
      [chainName]: balance.toString(),
    });
    await kv.expire(cacheKey, 60 * 60 * 24);
  } else {
    balance = BigNumber.from(cacheValue.toString());
  }

  return balance;
}

async function getStellarBalance(address: string): Promise<BigNumber> {
  const cacheKey = `balance-${address}`;
  const cacheValue = await kv.hget(cacheKey, "Stellar");

  let balance;

  if (!cacheValue) {
    const apiUrl = `https://horizon.stellar.org/accounts/${address}`;
    const res = await axios.get(apiUrl, {
      headers: { Accept: "application/json" },
    });
    const stellarBalanceValue = await res.data.balances.reduce(
      (acc: any, cur: any) =>
        cur.asset_code == "USDGLO" ? (acc += parseFloat(cur.balance)) : acc,
      0
    );
    balance = BigNumber.from(`${stellarBalanceValue}`.replace(".", ""));

    await kv.hset(cacheKey, {
      chainName: balance.toString(),
    });
    await kv.expire(cacheKey, 60 * 60 * 24);
  } else {
    balance = BigNumber.from(cacheValue);
  }

  return balance;
}

export async function getChainBlockNumber(
  date: Date,
  chain: Chain
): Promise<number> {
  const chainName = chain.name.toLowerCase();
  const utcDate = date ? date.toJSON().substring(0, 10) : "";

  const cacheKey = `blocknumber-${utcDate}`;
  const cacheValue: string | null = await kv.hget(cacheKey, chainName);

  let blockNumber;

  if (!cacheValue) {
    blockNumber = await getBlockNumber(date, chain.id);

    await kv.hset(cacheKey, {
      [chainName]: blockNumber.toString(),
    });
    await kv.expire(cacheKey, 60 * 60 * 24 * 183);
  } else {
    blockNumber = parseInt(cacheValue);
  }
  return blockNumber;
}

export async function getAverageBalance(
  walletAddress: string,
  startDate: Date,
  endDate: Date,
  endBalance: BigNumber,
  transactions: TokenTransfer[]
): Promise<number> {
  const milisecondsInMonth = BigNumber.from((endDate - startDate).toString());
  console.log("milisecondsInMonth: ", milisecondsInMonth.toString());
  let totalBalance = BigNumber.from("0");
  let currentDate = endDate;
  let currentBalance = endBalance;

  // console.log("transactions: ", transactions);
  console.log("currentBalance: ", currentBalance.toString());

  transactions.forEach((transaction) => {
    const txDate = new Date(transaction["timeStamp"] * 1000);
    const balanceTime = BigNumber.from((currentDate - txDate).toString());
    const weightedBalance = currentBalance.mul(balanceTime);
    console.log(weightedBalance.toString());
    totalBalance = totalBalance.add(weightedBalance);
    console.log("new totalBalance: ", totalBalance.toString());
    currentDate = txDate;
    const transactionDelta = BigNumber.from(transaction["value"]);
    currentBalance =
      transaction["from"].toLowerCase() === walletAddress.toLowerCase()
        ? currentBalance.add(transactionDelta)
        : currentBalance.sub(transactionDelta);
    console.log("new currentBalance: ", currentBalance.toString());
  });

  const balanceTime = currentDate - startDate;
  const weightedBalance = currentBalance.mul(BigNumber.from(balanceTime));
  totalBalance = totalBalance.add(weightedBalance);
  console.log("final totalbalance: ", totalBalance.toString());

  const decimals = BigInt(10 ** 18);
  const averageBalance = totalBalance.div(milisecondsInMonth);

  return averageBalance;
}
