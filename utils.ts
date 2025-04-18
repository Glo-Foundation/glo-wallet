import { Driver, SimpleNet, SimpleWallet } from "@vechain/connex-driver";
import { Framework } from "@vechain/connex-framework";
import * as thor from "@vechain/web3-providers-connex";
import { GetBalanceReturnType } from "@wagmi/core";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  celo,
  celoAlfajores,
  Chain,
  goerli,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  vechain,
} from "@wagmi/core/chains";
import EthDater from "ethereum-block-by-date";
import { ethers } from "ethers";
import localFont from "next/font/local";

import {
  defaultChainId,
  getChainRPCUrl,
  getSmartContractAddress,
} from "@/lib/config";
import { getAllowedChains } from "@/lib/utils";

const TOTAL_DAYS = 365;
const ANNUAL_INTEREST_RATE = 0.042;

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
    description: "Farm chicken",
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
  const decimals = parts.length > 1 ? parts[1][0] : 0;
  return `${parts[0]}.${decimals}${TIER_SUFFIX[parts.length - 1]}`;
};

export const getUSDCContractAddress = (chain: Chain): `0x${string}` => {
  const chainId = chain?.id || defaultChainId();
  switch (chainId) {
    case goerli.id: {
      return "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
    }
    case mainnet.id: {
      return "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    }
    case celo.id: {
      return "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
    }
    case celoAlfajores.id: {
      return "0x5263F75FFB7384690818BeAEa62D7313B69f2A9c";
    }
    case polygonMumbai.id: {
      return "0xF493Af87835D243058103006e829c72f3d34b891";
    }
    case optimism.id: {
      return "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
    }
    case optimismSepolia.id: {
      return "0x5fd84259d66Cd46123540766Be93DFE6D43130D7";
    }
    case arbitrum.id: {
      return "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
    }
    case arbitrumSepolia.id: {
      return "0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1";
    }
    case base.id: {
      return "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    }
    case baseSepolia.id: {
      return "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
    }
    case polygon.id:
    default: {
      return "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
    }
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

  switch (chain.id) {
    case mainnet.id: {
      outputCurrency = getSmartContractAddress(mainnet.id);
      swapChain = dex === "Uniswap" ? "mainnet" : "ethereum";
      break;
    }
    case goerli.id: {
      outputCurrency = getSmartContractAddress(goerli.id);
      swapChain = dex === "Uniswap" ? "goerli" : "ethereum";
      break;
    }
    case celo.id: {
      outputCurrency = getSmartContractAddress(celo.id);
      swapChain = "celo";
      break;
    }
    case celoAlfajores.id: {
      outputCurrency = getSmartContractAddress(celoAlfajores.id);
      swapChain = dex === "Uniswap" ? "celo_alfajores" : "celo";
      break;
    }
    case optimismSepolia.id: {
      outputCurrency = getSmartContractAddress(optimismSepolia.id);
      swapChain = "optimism_sepolia";
      break;
    }
    case arbitrum.id: {
      outputCurrency = getSmartContractAddress(arbitrum.id);
      swapChain = "arbitrum";
      break;
    }
    case arbitrumSepolia.id: {
      outputCurrency = getSmartContractAddress(arbitrumSepolia.id);
      swapChain = "arbitrum_sepolia";
      break;
    }
    case base.id: {
      outputCurrency = getSmartContractAddress(base.id);
      swapChain = "base";
      break;
    }
    case baseSepolia.id: {
      outputCurrency = getSmartContractAddress(baseSepolia.id);
      swapChain = "base_sepolia";
      break;
    }
    case polygonMumbai.id: {
      outputCurrency = getSmartContractAddress(polygonMumbai.id);
      swapChain = dex === "Uniswap" ? "polygon_mumbai" : "polygon";
      break;
    }
    case polygon.id: {
      outputCurrency = getSmartContractAddress(polygon.id);
      swapChain = "polygon";
      break;
    }
    case optimism.id:
    default: {
      outputCurrency = getSmartContractAddress(optimism.id);
      swapChain = "optimism";
      break;
    }
  }

  let outputUrl;
  switch (dex) {
    case "Matcha":
      outputUrl = `https://matcha.xyz/tokens/${swapChain}/${outputCurrency}`;
      break;
    case "Zeroswap":
      outputUrl = `https://app.zeroswap.io/swap/${chain.id}/${inputCurrency}/${outputCurrency}`;
      break;
    case "Uniswap":
    default:
      // exception for celo, we'll use cUSD instead of USDC as input
      if (chain.id === celo.id) {
        const cUSDContractAddress =
          "0x765de816845861e75a25fca122bb6898b8b1282a";
        outputUrl = `https://app.uniswap.org/#/swap?inputCurrency=${cUSDContractAddress}&outputCurrency=${outputCurrency}&exactAmount=${amount}&exactField=input&chain=${swapChain}`;
        break;
      }
      outputUrl = `https://app.uniswap.org/#/swap?inputCurrency=${inputCurrency}&outputCurrency=${outputCurrency}&exactAmount=${amount}&exactField=input&chain=${swapChain}`;
  }

  return outputUrl;
};

export const getJsonProvider = async (chainId: number) => {
  if (chainId === vechain.id) {
    const net = new SimpleNet("https://node-mainnet.vechain.energy");
    const wallet = new SimpleWallet();
    const driver = await Driver.connect(net, wallet);
    const connex = new Framework(driver);
    return thor.ethers.modifyProvider(
      new ethers.BrowserProvider(
        new thor.Provider({
          connex,
          wallet,
        })
      )
    );
  }
  return new ethers.JsonRpcProvider(getChainRPCUrl(chainId));
};

export const getBalance = async (
  address: string,
  chainId: number,
  blockTag?: number
): Promise<bigint> => {
  const provider = await getJsonProvider(chainId);
  const abi = ["function balanceOf(address account) view returns (uint256)"];
  const usdgloContract = new ethers.Contract(
    getSmartContractAddress(chainId),
    abi,
    provider
  );

  try {
    if (blockTag !== null && blockTag !== 0) {
      const params =
        chainId === vechain.id ? { blockNumber: blockTag } : { blockTag };

      return await usdgloContract.balanceOf.call(undefined, address, {
        ...params,
      });
    } else {
      return await usdgloContract.balanceOf(address);
    }
  } catch (err) {
    console.log(`Could not fetch balance for ${address} at ${chainId}`);
    console.log(err);
    return BigInt(0);
  }
};

export const numberToHex = (num: number): string => {
  return "0x" + num.toString(16);
};

export const hexToNumber = (hex: string): number => {
  return parseInt(hex, 16);
};

export const getTotalGloBalance = (
  balances: (GetBalanceReturnType | undefined)[]
): GetBalanceReturnType => {
  let totalBalanceValue = 0;
  for (const balance of balances) {
    if (balance) {
      totalBalanceValue += Number(balance!.formatted);
    }
  }

  return {
    decimals: 18,
    formatted: totalBalanceValue.toString(),
    symbol: "USDGLO",
    value: BigInt(totalBalanceValue * 10 ** 18) / BigInt(10 ** 18),
  };
};

export const customFormatBalance = (
  balance: GetBalanceReturnType | undefined
): {
  yearlyYield: number;
  yearlyYieldFormatted: string;
  yearlyYieldUSFormatted: string;
  dblFmtBalance: string;
  fmtBalanceDollarPart: string;
  fmtBalanceCentPart: string;
} => {
  const yearlyYield = getTotalYield(Number(balance ? balance.formatted : 0));
  const yearlyYieldFormatted =
    yearlyYield > 0 ? `$${yearlyYield.toFixed(2)}` : "$0";
  const yearlyYieldUSFormatted =
    yearlyYield > 0 ? `$${getUSFormattedNumber(yearlyYield)}` : "$0";

  const dblFmtBalance = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(Number(balance ? balance.formatted : 0))
    .replaceAll(",", "");

  const splitFmtBalance = dblFmtBalance.split(".");
  const fmtBalanceDollarPart = splitFmtBalance[0];
  let fmtBalanceCentPart = splitFmtBalance[1];
  if (fmtBalanceCentPart === undefined) {
    fmtBalanceCentPart = "00";
  } else if (fmtBalanceCentPart?.length === 1) {
    fmtBalanceCentPart += "0";
  }

  return {
    yearlyYield,
    yearlyYieldFormatted,
    yearlyYieldUSFormatted,
    dblFmtBalance,
    fmtBalanceDollarPart,
    fmtBalanceCentPart,
  };
};

export const getBlockNumber = async (
  date: Date,
  chainId: number
): Promise<number> => {
  const provider = await getJsonProvider(chainId);

  // ethereum-block-by-date -> ethers 5.7
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dater = new EthDater(provider as any);

  try {
    const blockObject = await dater.getDate(date.toString());

    return blockObject.block;
  } catch (err) {
    console.log(`Can't get block number for chain ${chainId}`);
    return 0;
  }
};

export const neueHaasGrotesk = localFont({
  src: [
    {
      path: "./public/fonts/NeueHaasGroteskText65Medium.woff2",
      weight: "400",
    },
    {
      path: "./public/fonts/NeueHaasGroteskText75Bold.woff2",
      weight: "600",
    },
  ],
  variable: "--font-neuehaasgrotesk",
  display: "swap",
});

export const polySans = localFont({
  src: [
    {
      path: "./public/fonts/PolySans-Neutral.woff2",
      weight: "400",
    },
    {
      path: "./public/fonts/PolySans-Median.woff2",
      weight: "600",
    },
  ],
  variable: "--font-polysans",
  display: "swap",
});

export const POPUP_PROPS =
  "toolbar=1,scrollbars=1,location=0,statusbar=0,menubar=1,resizable=1,width=900, height=800,top=0";

export const getCoinbaseOnRampUrl = (
  address: string,
  buyAmount: number,
  redirectUrl: string,
  chain?: Chain
) => {
  const chainMap: { [key: string]: string } = {
    "op mainnet": "optimism",
    "arbitrum one": "arbitrum",
  };
  const name = chain?.name.toLowerCase() || "";
  return `https://pay.coinbase.com/buy/select-asset?appId=${
    process.env.NEXT_PUBLIC_CPD_PROJECT_ID
  }&addresses={"${address}":["${
    chainMap[name] || name
  }"]}&presetCryptoAmount=${buyAmount}&assets=["USDC"]&redirectUrl=${redirectUrl}`;
};

export const getCoinbaseOffRampUrl = (
  address: string,
  buyAmount: number,
  redirectUrl: string,
  chain?: Chain
) => {
  const chainMap: { [key: string]: string } = {
    "op mainnet": "optimism",
    "arbitrum one": "arbitrum",
  };
  const name = chain?.name.toLowerCase() || "";
  return `https://pay.coinbase.com/v3/sell/input?appId=${
    process.env.NEXT_PUBLIC_CPD_PROJECT_ID
  }&addresses={"${address}":["${
    chainMap[name] || name
  }"]}&presetCryptoAmount=${buyAmount}&assets=["USDC"]&partnerUserId=${address}&redirectUrl=${redirectUrl}`;
};

export const WC_COOKIE = "recently-used-wc";
