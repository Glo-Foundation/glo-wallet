import { Chain } from "@wagmi/core";
import { goerli, mainnet, polygon } from "@wagmi/core/chains";
import { BigNumber, ethers } from "ethers";

import { getChainRPCUrl, getSmartContractAddress } from "@/lib/config";
import { getAllowedChains } from "@/lib/utils";

const TOTAL_DAYS = 365;
const ANNUAL_INTEREST_RATE = 0.024;

export const getTotalYield = (amount: number): number => {
  return (amount * ANNUAL_INTEREST_RATE * TOTAL_DAYS) / 365;
};

// descending order of cost
// multiplying every item by 1.11 because givedirectly is only 90% efficient with the yield received
const possibleImpactItems = [
  {
    description: "20 litres of water",
    cost: 0.03 * 1.11,
    emoji: "🚰",
  },
  {
    description: "kg of maize",
    cost: 0.95 * 1.11,
    emoji: "🌽",
  },
  {
    description: "School textbook",
    cost: 1.22 * 1.11,
    emoji: "📚",
  },
  {
    description: "School uniform",
    cost: 3.24 * 1.11,
    emoji: "🧑‍🏫",
  },
  {
    description: "Kienyeji farm chicken",
    cost: 12 * 1.11,
    emoji: "🐔",
  },
  {
    description: "Fishing net",
    cost: 100 * 1.11,
    emoji: "🎣",
  },
  {
    description: "Saanen dairy goat",
    cost: 121 * 1.11,
    emoji: "🐐",
  },
  {
    description: "Inventory to start a kiosk",
    cost: 162 * 1.11,
    emoji: "🏪",
  },
  {
    description: "Dairy cow",
    cost: 200 * 1.11,
    emoji: "🐄",
  },
  {
    description: "House building materials",
    cost: 227 * 1.11,
    emoji: "🧱",
  },
  {
    description: "80 m² of farm land",
    cost: 300 * 1.11,
    emoji: "🌱",
  },
  {
    description: "Person out of extreme poverty",
    // 480 already takes into account givedirectly inefficiency figure
    cost: 480,
    emoji: "🧑",
  },
].sort((item1, item2) => item2.cost - item1.cost);

export interface GetImpactItem {
  description: string;
  cost: number;
  emoji: string;
  count?: number;
  idx?: number;
}
export const getImpactItems = (amount: number): GetImpactItem[] => {
  const impactItems = [];
  for (let idx = 0; amount > 0 && idx < possibleImpactItems.length; idx++) {
    const possibleImpactItem = possibleImpactItems[idx];
    if (amount >= possibleImpactItem.cost) {
      const itemCount = Math.floor(amount / possibleImpactItem.cost);
      impactItems.push({ ...possibleImpactItem, count: itemCount, idx: idx });
    }
  }
  return impactItems;
};

export const isLiftPersonOutOfPovertyImpactItem = (
  impactItem: GetImpactItem
): boolean => {
  return impactItem.description === "Person out of extreme poverty";
};

export const getUSFormattedNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const TIER_SUFFIX = ["", "K", "M", "B", "T"];
export const getNiceNumber = (num: number) => {
  const base = getUSFormattedNumber(num);

  const parts = base.split(",");
  return `${parts[0]}.${parts[1][0]}${TIER_SUFFIX[parts.length - 1]}`;
};

export const getUSDCContractAddress = (chain: Chain): `0x${string}` => {
  if (chain.id === mainnet.id || chain.id === goerli.id) {
    return "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  } else {
    return "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  }
};

export const getUSDCToUSDGLOSwapDeeplink = (
  amount: number,
  chain: Chain,
  dex: string
): string => {
  const chainAllowed = getAllowedChains().some(
    (allowedChain) => allowedChain.id === chain?.id
  );
  if (!chainAllowed) {
    return "";
  }

  const inputCurrency = getUSDCContractAddress(chain);
  let outputCurrency, swapChain;
  if (chain.id === mainnet.id || chain.id === goerli.id) {
    outputCurrency = getSmartContractAddress(mainnet.id);
    swapChain = dex === "Uniswap" ? "mainnet" : "ethereum";
  } else {
    outputCurrency = getSmartContractAddress(polygon.id);
    swapChain = "polygon";
  }

  let outputUrl;
  switch (dex) {
    case "Matcha":
      outputUrl = `https://matcha.xyz/tokens/${swapChain}/${outputCurrency}`;
      break;
    case "Zeroswap":
      outputUrl = `https://app.zeroswap.io/swap/${chain.id}/${inputCurrency}/${outputCurrency}`;
      break;
    default:
      outputUrl = `https://app.uniswap.org/#/swap?inputCurrency=${inputCurrency}&outputCurrency=${outputCurrency}&exactAmount=${amount}&exactField=input&chain=${swapChain}`;
  }

  return outputUrl;
};

export const getBalance = async (
  address: string,
  chainId?: number
): Promise<BigNumber> => {
  const provider = new ethers.providers.JsonRpcProvider(
    getChainRPCUrl(chainId)
  );
  const abi = ["function balanceOf(address account) view returns (uint256)"];
  const usdgloContract = new ethers.Contract(
    getSmartContractAddress(chainId),
    abi,
    provider
  );
  return await usdgloContract.balanceOf(address);
};

export const numberToHex = (num: number): string => {
  return "0x" + num.toString(16);
};

export const hexToNumber = (hex: string): number => {
  return parseInt(hex, 16);
};
