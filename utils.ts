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
  B3TR,
  USDGLO,
  VECHAIN_B3TR_USDGLO_POOL,
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

export const getVeChainTokenBalance = async (
  tokenAddress: string,
  walletAddress: string,
  chainId: number
): Promise<bigint> => {
  try {
    const provider = await getJsonProvider(chainId);
    const abi = ["function balanceOf(address account) view returns (uint256)"];
    const tokenContract = new ethers.Contract(tokenAddress, abi, provider);
    return await tokenContract.balanceOf(walletAddress);
  } catch (err) {
    console.log(
      `Could not fetch token balance for ${walletAddress} on chain ${chainId}`
    );
    console.log(err);
    return BigInt(0);
  }
};

export const getVeChainLiquidityPoolInfo = async (
  poolAddress: string,
  chainId: number
): Promise<{
  token0: string;
  token1: string;
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
}> => {
  try {
    const provider = await getJsonProvider(chainId);
    const abi = [
      "function token0() view returns (address)",
      "function token1() view returns (address)",
      "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
      "function totalSupply() view returns (uint256)",
    ];
    const poolContract = new ethers.Contract(poolAddress, abi, provider);

    const [token0, token1, reserves, totalSupply] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.getReserves(),
      poolContract.totalSupply(),
    ]);

    return {
      token0,
      token1,
      reserve0: BigInt(reserves._reserve0),
      reserve1: BigInt(reserves._reserve1),
      totalSupply: BigInt(totalSupply),
    };
  } catch (err) {
    console.log(
      `Could not fetch pool info for ${poolAddress} on chain ${chainId}`
    );
    console.log(err);
    return {
      token0: "",
      token1: "",
      reserve0: BigInt(0),
      reserve1: BigInt(0),
      totalSupply: BigInt(0),
    };
  }
};

export const getPairReserves = async (
  pairAddress: string,
  chainId: number
): Promise<{
  reserve0: bigint;
  reserve1: bigint;
  blockTimestampLast: number;
}> => {
  try {
    const provider = await getJsonProvider(chainId);
    const abi = [
      "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
    ];
    const pairContract = new ethers.Contract(pairAddress, abi, provider);

    const reserves = await pairContract.getReserves();

    return {
      reserve0: BigInt(reserves._reserve0),
      reserve1: BigInt(reserves._reserve1),
      blockTimestampLast: Number(reserves._blockTimestampLast),
    };
  } catch (err) {
    console.log(
      `Could not fetch reserves for pair ${pairAddress} on chain ${chainId}`
    );
    console.log(err);
    return {
      reserve0: BigInt(0),
      reserve1: BigInt(0),
      blockTimestampLast: 0,
    };
  }
};

export const getQuoteFromRouter = async (
  routerAddress: string,
  amountA: bigint,
  reserveA: bigint,
  reserveB: bigint,
  chainId: number
): Promise<bigint> => {
  try {
    const provider = await getJsonProvider(chainId);
    const abi = [
      "function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) pure returns (uint256 amountB)",
    ];
    const routerContract = new ethers.Contract(routerAddress, abi, provider);

    const amountB = await routerContract.quote(amountA, reserveA, reserveB);
    return BigInt(amountB);
  } catch (err) {
    console.log(
      `Could not get quote from router ${routerAddress} on chain ${chainId}`
    );
    console.log(err);
    return BigInt(0);
  }
};

// Pure calculation function (client-side calculation without contract call)
export const calculateQuote = (
  amountA: bigint,
  reserveA: bigint,
  reserveB: bigint
): bigint => {
  if (reserveA === BigInt(0)) {
    return BigInt(0);
  }
  return (amountA * reserveB) / reserveA;
};

export const calculateLiquidityTokensToMint = (
  amountA: bigint,
  amountB: bigint,
  reserveA: bigint,
  reserveB: bigint,
  totalSupply: bigint
): bigint => {
  if (totalSupply === BigInt(0)) {
    // Initial liquidity - geometric mean minus minimum liquidity
    const liquidity = (amountA * amountB) ** BigInt(1 / 2) - BigInt(1000);
    return liquidity > BigInt(0) ? liquidity : BigInt(0);
  } else {
    // Subsequent liquidity - minimum of proportional amounts
    const liquidityA = (amountA * totalSupply) / reserveA;
    const liquidityB = (amountB * totalSupply) / reserveB;
    return liquidityA < liquidityB ? liquidityA : liquidityB;
  }
};

export const calculateTokensFromLiquidity = (
  liquidity: bigint,
  totalSupply: bigint,
  reserveA: bigint,
  reserveB: bigint
): { amountA: bigint; amountB: bigint } => {
  const amountA = (liquidity * reserveA) / totalSupply;
  const amountB = (liquidity * reserveB) / totalSupply;
  return { amountA, amountB };
};

// VeChain Router Contract Address (replace with actual router address)
export const VECHAIN_ROUTER_ADDRESS =
  "0x349Ede93B675c0F0f8d7CdaD74eCF1419943E6ac"; // Replace with actual router address

// Helper function to format units (similar to ethers formatUnits)
const formatUnits = (value: bigint, decimals = 18): string => {
  return (Number(value) / Math.pow(10, decimals)).toFixed(4);
};

export const addVeChainLiquidity = async (
  connex: any,
  tokenA: string,
  tokenB: string,
  amountADesired: bigint,
  amountBDesired: bigint,
  userAddress: string,
  slippageTolerance = 0.5 // 0.5% default slippage
): Promise<any> => {
  try {
    // Calculate minimum amounts with slippage tolerance
    const slippageMultiplier = (100 - slippageTolerance) / 100;
    const amountAMin = BigInt(
      Math.floor(Number(amountADesired) * slippageMultiplier)
    );
    const amountBMin = BigInt(
      Math.floor(Number(amountBDesired) * slippageMultiplier)
    );

    // Set deadline to 20 minutes from now
    const deadline = Math.floor(Date.now() / 1000) + 1200;

    // addLiquidity ABI
    const addLiquidityABI = {
      inputs: [
        { internalType: "address", name: "tokenA", type: "address" },
        { internalType: "address", name: "tokenB", type: "address" },
        { internalType: "uint256", name: "amountADesired", type: "uint256" },
        { internalType: "uint256", name: "amountBDesired", type: "uint256" },
        { internalType: "uint256", name: "amountAMin", type: "uint256" },
        { internalType: "uint256", name: "amountBMin", type: "uint256" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "deadline", type: "uint256" },
      ],
      name: "addLiquidity",
      outputs: [
        { internalType: "uint256", name: "amountA", type: "uint256" },
        { internalType: "uint256", name: "amountB", type: "uint256" },
        { internalType: "uint256", name: "liquidity", type: "uint256" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    };

    // Approve ABI for token approvals
    const approveABI = {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    };

    // Prepare approval clauses for both tokens
    const tokenAContract = connex.thor.account(tokenA).method(approveABI);
    const tokenBContract = connex.thor.account(tokenB).method(approveABI);
    const routerContract = connex.thor
      .account(VECHAIN_ROUTER_ADDRESS)
      .method(addLiquidityABI);

    const tokenAApprovalClause = tokenAContract.asClause(
      VECHAIN_ROUTER_ADDRESS,
      amountADesired.toString()
    );
    const tokenBApprovalClause = tokenBContract.asClause(
      VECHAIN_ROUTER_ADDRESS,
      amountBDesired.toString()
    );

    // Prepare addLiquidity clause
    const addLiquidityClause = routerContract.asClause(
      tokenA,
      tokenB,
      amountADesired.toString(),
      amountBDesired.toString(),
      amountAMin.toString(),
      amountBMin.toString(),
      userAddress,
      deadline.toString()
    );

    // Create transaction with all clauses
    const clauses = [
      {
        comment: `Approve ${formatUnits(amountADesired, 18)} ${
          tokenA === B3TR ? "B3TR" : "Token A"
        }`,
        ...tokenAApprovalClause,
      },
      {
        comment: `Approve ${formatUnits(amountBDesired, 18)} ${
          tokenB === USDGLO ? "USDGLO" : "Token B"
        }`,
        ...tokenBApprovalClause,
      },
      {
        comment: `Add liquidity: ${formatUnits(
          amountADesired,
          18
        )} + ${formatUnits(amountBDesired, 18)}`,
        ...addLiquidityClause,
      },
    ];

    console.log("Sending liquidity transaction with clauses:", clauses);

    // Send transaction
    const result = await connex.vendor
      .sign("tx", clauses)
      .signer(userAddress)
      .gas(500000) // Set maximum gas for liquidity operations
      .comment(
        `Add liquidity: ${formatUnits(amountADesired, 18)} ${
          tokenA === B3TR ? "B3TR" : "TokenA"
        } + ${formatUnits(amountBDesired, 18)} ${
          tokenB === USDGLO ? "USDGLO" : "TokenB"
        }`
      )
      .request();

    console.log("Liquidity transaction result:", result);
    return result;
  } catch (error) {
    console.error("Error adding VeChain liquidity:", error);
    throw error;
  }
};

// Get LP token total supply
export const getLPTokenTotalSupply = async (
  lpTokenAddress: string,
  chainId: number
): Promise<bigint> => {
  try {
    const provider = await getJsonProvider(chainId);
    const abi = ["function totalSupply() view returns (uint256)"];
    const lpContract = new ethers.Contract(lpTokenAddress, abi, provider);

    const totalSupply = await lpContract.totalSupply();
    return BigInt(totalSupply);
  } catch (err) {
    console.log(
      `Could not fetch LP token total supply for ${lpTokenAddress} on chain ${chainId}`
    );
    console.log(err);
    return BigInt(0);
  }
};

// Calculate tokens to receive when removing liquidity
export const calculateRemoveLiquidityAmounts = (
  lpTokenAmount: bigint,
  totalSupply: bigint,
  reserve0: bigint,
  reserve1: bigint
): { amount0: bigint; amount1: bigint; percentage: number } => {
  if (totalSupply === BigInt(0)) {
    return { amount0: BigInt(0), amount1: BigInt(0), percentage: 0 };
  }

  const amount0 = (lpTokenAmount * reserve0) / totalSupply;
  const amount1 = (lpTokenAmount * reserve1) / totalSupply;
  const percentage =
    Number((lpTokenAmount * BigInt(10000)) / totalSupply) / 100;

  return { amount0, amount1, percentage };
};

export const removeVeChainLiquidity = async (
  connex: any,
  tokenA: string,
  tokenB: string,
  liquidity: bigint,
  userAddress: string,
  slippageTolerance = 0.5 // 0.5% default slippage
): Promise<any> => {
  try {
    // Calculate minimum amounts with slippage tolerance
    const slippageMultiplier = (100 - slippageTolerance) / 100;

    // For remove liquidity, we need to calculate expected amounts first
    // This would typically require knowing the current reserves and total supply
    // For now, we'll set minimum amounts to 0 (can be improved)
    const amountAMin = BigInt(0); // Should be calculated based on expected amounts
    const amountBMin = BigInt(0); // Should be calculated based on expected amounts

    // Set deadline to 20 minutes from now
    const deadline = Math.floor(Date.now() / 1000) + 1200;

    // removeLiquidity ABI
    const removeLiquidityABI = {
      inputs: [
        { internalType: "address", name: "tokenA", type: "address" },
        { internalType: "address", name: "tokenB", type: "address" },
        { internalType: "uint256", name: "liquidity", type: "uint256" },
        { internalType: "uint256", name: "amountAMin", type: "uint256" },
        { internalType: "uint256", name: "amountBMin", type: "uint256" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "deadline", type: "uint256" },
      ],
      name: "removeLiquidity",
      outputs: [
        { internalType: "uint256", name: "amountA", type: "uint256" },
        { internalType: "uint256", name: "amountB", type: "uint256" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    };

    // Approve ABI for LP token approval
    const approveABI = {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    };

    // Prepare approval clause for LP token
    const lpTokenContract = connex.thor
      .account(VECHAIN_B3TR_USDGLO_POOL)
      .method(approveABI);
    const routerContract = connex.thor
      .account(VECHAIN_ROUTER_ADDRESS)
      .method(removeLiquidityABI);

    const lpTokenApprovalClause = lpTokenContract.asClause(
      VECHAIN_ROUTER_ADDRESS,
      liquidity.toString()
    );

    // Prepare removeLiquidity clause
    const removeLiquidityClause = routerContract.asClause(
      tokenA,
      tokenB,
      liquidity.toString(),
      amountAMin.toString(),
      amountBMin.toString(),
      userAddress,
      deadline.toString()
    );

    // Create transaction with all clauses
    const clauses = [
      {
        comment: `Approve ${formatUnits(liquidity, 18)} LP tokens`,
        ...lpTokenApprovalClause,
      },
      {
        comment: `Remove liquidity: ${formatUnits(liquidity, 18)} LP tokens`,
        ...removeLiquidityClause,
      },
    ];

    console.log("Sending remove liquidity transaction with clauses:", clauses);

    // Send transaction
    const result = await connex.vendor
      .sign("tx", clauses)
      .signer(userAddress)
      .gas(300000) // Set maximum gas for remove liquidity operations
      .comment(`Remove liquidity: ${formatUnits(liquidity, 18)} LP tokens`)
      .request();

    console.log("Remove liquidity transaction result:", result);
    return result;
  } catch (error) {
    console.error("Error removing VeChain liquidity:", error);
    throw error;
  }
};

export const WC_COOKIE = "recently-used-wc";
