import { Chain } from "@wagmi/core";
import {
  mainnet,
  polygon,
  celo,
  celoAlfajores,
  optimism,
  optimismSepolia,
  arbitrum,
  arbitrumSepolia,
} from "@wagmi/core/chains";
import axios, { AxiosInstance } from "axios";
import { BigNumber, ethers } from "ethers";

import UsdgloContract from "@/abi/usdglo.json";

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
  return getAllowedChains();
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
    ? [optimism, polygon, mainnet, celo, arbitrum]
    : [optimismSepolia, arbitrumSepolia, celoAlfajores];
};

export const getStellarMarketCap = async (): Promise<number> => {
  const apiUrl =
    "https://horizon.stellar.org/assets?asset_code=USDGLO&asset_issuer=GBBS25EGYQPGEZCGCFBKG4OAGFXU6DSOQBGTHELLJT3HZXZJ34HWS6XV";
  const res = await axios.get(apiUrl, {
    headers: { Accept: "application/json" },
  });
  const stellarBalancesString = await res.data._embedded.records[0].amount;
  const stellarBalances = parseFloat(stellarBalancesString);
  const stellarLiquidityPoolsString = await res.data._embedded.records[0]
    .liquidity_pools_amount;
  const stellarLiquidityPools = parseFloat(stellarLiquidityPoolsString);
  const stellarMarketCap = stellarBalances + stellarLiquidityPools;
  return stellarMarketCap;
};

// GUSD: 3306
// PYUSD: 27772
// USDP: 3330
// FDUSD: 26081
// TUSD: 2563
// USDC: 3408
// USDT: 825
// USDGLO: 23888

export const getCMCMarketCap = async (): Promise<BigNumber> => {
  const apiUrl =
    "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest";
  const res = await axios.get(apiUrl, {
    params: { id: "3408,2563,26081,3330,27772,3306,23888,28443,825,29569" }, // get all usd stablecoins from coinmarketcap
    headers: { "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY },
  });

  return await res.data.data;
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

export type CharityRecord = {
  name: string;
  short_name: string;
  iconPath: string;
  description: string;
  type: string;
};

export const CHARITY_MAP: Record<string, CharityRecord> = {
  ["EXTREME_POVERTY"]: {
    name: "Fight extreme poverty",
    short_name: "Extreme poverty",
    iconPath: "/give-directly-logo.jpeg",
    description: "Fund basic income programs for people in extreme poverty",
    type: "",
  },
  ["OPEN_SOURCE"]: {
    name: "Web3 public goods",
    short_name: "Public Goods",
    iconPath: "/gitcoin-grants-logo.jpeg",
    description: "Support causes that advance public goods in Web3",
    type: "",
  },
  ["REFUGEE_CRISIS"]: {
    name: "Help refugees",
    short_name: "Refugees",
    iconPath: "/refugee-camp.png",
    description:
      "Save lives and build better futures for people forced to flee their homes",
    type: "",
  },
  ["CLIMATE"]: {
    name: "Combat climate change",
    short_name: "Climate",
    iconPath: "/giving-green-logo.png",
    description:
      "Donate to best-in-class charities working to decarbonize the planet",
    type: "",
  },
  ["ENDAOMENT"]: {
    name: "Endaoment Universal Impact Pool",
    short_name: "Endaoment",
    iconPath: "/endaoment-logo.svg",
    description:
      "Can't decide? Follow group wisdom. Fund the 50+ most popular charities on Endaoment",
    type: "",
  },
  // ["SAVE_LIVES"]: {
  //   name: "Save Lives",
  //   short_name: "Saving lives",
  //   iconPath: "/givewell-logo.jpeg",
  //   description:
  //     "Funds charities that save or improve lives the most per dollar donated",
  //   type: "",
  // },
  // ["ANIMAL_LIVES"]: {
  //   name: "Improve Animal Welfare",
  //   short_name: "Animals",
  //   iconPath: "/give-directly-logo.jpeg",
  //   description: "Funds basic income programs for people in extreme poverty",
  //   type: "",
  // }
};
