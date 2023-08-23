import { Chain } from "@wagmi/core";
import {
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
  celo,
  celoAlfajores,
} from "@wagmi/core/chains";
import axios, { AxiosInstance } from "axios";
import { BigNumber, ethers } from "ethers";

import UsdgloContract from "@/abi/usdglo.json";
import { KVBalanceResponse } from "@/pages/api/balances/[address]";
import { getBalance, hexToNumber } from "@/utils";

import { getChainRPCUrl, getSmartContractAddress } from "./config";

export const sliceAddress = (address: string, amt = 3) =>
  `${address?.slice(0, amt + 2)}...${address?.slice(amt * -1)}`;

export const lastSliceAddress = (address: string | string[], amt = 4) =>
  `${address?.slice(amt * -1)}`;

export let apiInstance: AxiosInstance;
let apiInstanceWallet = "";

export const initApi = async (
  address: string,
  chainId: number,
  signature: string
) => {
  if (!apiInstance || apiInstanceWallet !== address) {
    apiInstanceWallet = address;
    apiInstance = axios.create({
      baseURL: "/api/",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${signature}`,
        "glo-pub-address": address,
        "glo-chain-id": chainId,
      },
    });
  }
  return apiInstance;
};

export const api = () => apiInstance;

export const isProd = () => process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export const isE2E = () => process.env.E2E === "true";

export const getChains = (): Chain[] => {
  if (isE2E()) {
    return [polygon] as Chain[];
  }
  return (isProd() ? [polygon, mainnet] : [polygonMumbai, goerli]) as Chain[];
};

export const signMsgContent = "glo-wallet";

export const DEFAULT_CTAS: CTA[] = [
  "TWEEET_IMPACT",
  "JOIN_PROGRAM",
  "BUY_GLO_MERCH",
].map((cta) => ({ type: cta } as CTA));

export const getMarketCap = async (chainId?: number): Promise<BigNumber> => {
  const provider = new ethers.providers.JsonRpcProvider(
    getChainRPCUrl(chainId)
  );

  const usdgloContract = new ethers.Contract(
    getSmartContractAddress(chainId),
    UsdgloContract,
    provider
  );
  return await usdgloContract.totalSupply();
};

export const getAllowedChains = (): Chain[] => {
  return isProd()
    ? [polygon, mainnet, celo]
    : [polygonMumbai, goerli, celoAlfajores];
};

export const formatBalance = (balance: {
  formatted: string;
  value: number;
}) => {
  const formatted = Number(balance.formatted);
  const val = BigNumber.from(balance.value);

  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(formatted || 0);
};

export const GLO_DECIMALS = BigInt(10 ** 18);

export const bigNumberToNumber = (b: BigNumber, decimals: number): number => {
  return hexToNumber(b._hex) / 10 ** decimals;
};

export const fetchBalance = async (address: string) => {
  if (!address) {
    return;
  }

  const { data } = await axios.get<KVBalanceResponse>(
    `/api/balances/${address}`
  );

  if (data) {
    const { balance } = data;
    return balance;
  }

  const chains = getAllowedChains();
  const DECIMALS = 18;
  const polygonBalance = bigNumberToNumber(
    await getBalance(address as string, chains[0].id),
    DECIMALS
  );
  const ethereumBalance = bigNumberToNumber(
    await getBalance(address as string, chains[1].id),
    DECIMALS
  );
  const celoBalance = bigNumberToNumber(
    await getBalance(address as string, chains[2].id),
    DECIMALS
  );

  return {
    polygonBalance,
    ethereumBalance,
    celoBalance,
  };
};
