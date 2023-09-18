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
import { BigNumber } from "ethers";

import { isProd } from "@/lib/utils";
import { getBalance } from "@/utils";

export const getBalances = async (address: string) => {
  const [polygonBalance, ethereumBalance, celoBalance] = await Promise.all([
    getChainBalance(address, isProd() ? polygon : polygonMumbai),
    getChainBalance(address, isProd() ? mainnet : goerli),
    getChainBalance(address, isProd() ? celo : celoAlfajores),
  ]);

  const decimals = BigInt(10 ** 18);
  const balance = polygonBalance
    .add(ethereumBalance)
    .add(celoBalance)
    .div(decimals)
    .toNumber();

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
