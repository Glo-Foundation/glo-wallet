import { kv } from "@vercel/kv";
import { Chain } from "@wagmi/core";
import {
  celo,
  celoAlfajores,
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
} from "@wagmi/core/chains";
import axios from "axios";
import { BigNumber } from "ethers";

import { isProd } from "@/lib/utils";
import { getBalance } from "@/utils";

export const getBalances = async (address: string) => {
  let balance = BigNumber.from("0");
  let [polygonBalance, ethereumBalance, celoBalance] = [
    balance,
    balance,
    balance,
  ];
  if (address.slice(0, 4).includes("0x")) {
    [polygonBalance, ethereumBalance, celoBalance] = await Promise.all([
      getChainBalance(address, isProd() ? polygon : polygonMumbai),
      getChainBalance(address, isProd() ? mainnet : goerli),
      getChainBalance(address, isProd() ? celo : celoAlfajores),
    ]);
    const decimals = BigInt(10 ** 18);
    balance = polygonBalance
      .add(ethereumBalance)
      .add(celoBalance)
      .div(decimals)
      .toNumber();
  } else {
    const stellarBalance = await getStellarBalance(address);
    const decimals = BigInt(10 ** 7);
    balance = stellarBalance.div(decimals).toNumber();
  }

  return {
    totalBalance: balance,
    polygonBalance,
    ethereumBalance,
    celoBalance,
  };
};

async function getChainBalance(
  address: string,
  chain: Chain
): Promise<BigNumber> {
  const chainName = chain.name.toLowerCase();

  const cacheKey = `balance-${address}`;
  const cacheValue = await kv.hget(cacheKey, chainName);

  let balance;

  if (!cacheValue) {
    balance = await getBalance(address as string, chain.id);
    await kv.hset(cacheKey, {
      chainName: balance.toString(),
    });
    await kv.expire(cacheKey, 60 * 60 * 24);
  } else {
    balance = BigNumber.from(cacheValue);
  }

  return balance;
}

async function getStellarBalance(address): Promise<BigNumber> {
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
