import { kv } from "@vercel/kv";
import { BigNumber } from "ethers";

import { getAllowedChains } from "@/lib/utils";
import { getBalance, customFormatBalance } from "@/utils";

export const getToTalBalances = async (address: string) => {
  const chains = getAllowedChains();

  const { polygonBalanceFormatted, polygonBalance } = await getPolygonBalance(
    address as string,
    chains
  );

  const { ethereumBalanceFormatted, ethereumBalance } =
    await getEthereumBalance(address as string, chains);

  const { celoBalanceFormatted, celoBalance } = await getCeloBalance(
    address as string,
    chains
  );

  const decimals = BigInt(10 ** 18);
  const balance = polygonBalance
    .add(ethereumBalance)
    .add(celoBalance)
    .div(decimals)
    .toNumber();

  return {
    balance,
    polygonBalanceFormatted,
    ethereumBalanceFormatted,
    celoBalanceFormatted,
  };
};

async function getCeloBalance(
  address: string | string[],
  chains: { id: number | undefined }[]
) {
  const kvValue = await kv.hget(`balance-${address as string}`, "celo");

  const celoBalance = kvValue
    ? BigNumber.from(BigInt(kvValue as string))
    : await getBalance(address as string, chains[2].id);

  if (!kvValue) {
    await kv.hset(`balance-${address as string}`, {
      celo: celoBalance.toString(),
    });
    await kv.expire(`balance-${address as string}`, 60 * 60 * 24);
  }

  const celoBalanceValue = BigInt(celoBalance.toString()) / BigInt(10 ** 18);
  const celoBalanceFormatted = customFormatBalance({
    decimals: 18,
    formatted: celoBalanceValue.toString(),
    symbol: "USDGLO",
    value: celoBalanceValue,
  });
  return { celoBalanceFormatted, celoBalance };
}

async function getEthereumBalance(
  address: string | string[],
  chains: { id: number | undefined }[]
) {
  const kvValue = await kv.hget(`balance-${address as string}`, "ethereum");

  const ethereumBalance = kvValue
    ? BigNumber.from(BigInt(kvValue as string))
    : await getBalance(address as string, chains[1].id);

  if (!kvValue) {
    await kv.hset(`balance-${address as string}`, {
      ethereum: ethereumBalance.toString(),
    });
    await kv.expire(`balance-${address as string}`, 60 * 60 * 24);
  }

  const ethereumBalanceValue =
    BigInt(ethereumBalance.toString()) / BigInt(10 ** 18);
  const ethereumBalanceFormatted = customFormatBalance({
    decimals: 18,
    formatted: ethereumBalanceValue.toString(),
    symbol: "USDGLO",
    value: ethereumBalanceValue,
  });
  return { ethereumBalanceFormatted, ethereumBalance };
}

async function getPolygonBalance(
  address: string | string[],
  chains: { id: number | undefined }[]
) {
  const kvValue = await kv.hget(`balance-${address as string}`, "polygon");

  const polygonBalance = kvValue
    ? BigNumber.from(BigInt(kvValue as string))
    : await getBalance(address as string, chains[0].id);

  if (!kvValue) {
    await kv.hset(`balance-${address as string}`, {
      polygon: polygonBalance.toString(),
    });
    await kv.expire(`balance-${address as string}`, 60 * 60 * 24);
  }

  const polygonBalanceValue =
    BigInt(polygonBalance.toString()) / BigInt(10 ** 18);
  const polygonBalanceFormatted = customFormatBalance({
    decimals: 18,
    formatted: polygonBalanceValue.toString(),
    symbol: "USDGLO",
    value: polygonBalanceValue,
  });
  return { polygonBalanceFormatted, polygonBalance };
}
