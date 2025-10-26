import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import QuoterV2 from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import axios from "axios";
import { ethers, formatUnits } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { Chain, formatEther } from "viem";
import { arbitrum, base, celo, mainnet, optimism, polygon } from "viem/chains";

import { getSmartContractAddress } from "@/lib/config";
import { getBalance, getJsonProvider } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authHeader = req.headers["authorization"];
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  const result = await collect({ isCron });

  return res.status(200).json(result);
}

const ADDR_CHAIN_OTHR: { [poolAddr: string]: [Chain, string, string] } = {
  "0x13c6656a9a7c136ab651fa331e9264223f5bf9e4": [
    mainnet,
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "etherscan.io",
  ],
  "0x98c3648a2087df2a1c2a5b695de908bf95fa4f39": [
    optimism,
    "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    "optimistic.etherscan.io",
  ],
  "0x6DB8d9D795C053ad0fd24723320E47b2a21c3dC1": [
    base,
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "basescan.org",
  ],
  "0x180bcf9197bce5a94b629289c7cd5c25329ab1c7": [
    polygon,
    "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    "polygonscan.com",
  ],
  "0x20f960d5b11d7b35072a38abff28ab882824c9b8": [
    arbitrum,
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "arbiscan.io",
  ],
  "0x7b9a5bc920610f54881f2f6359007957de504862": [
    celo,
    "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    "celoscan.io",
  ],
};

const fetchBalance = async (
  chainId: number,
  poolAddr: string,
  token: string
) => {
  const result = await axios.get("https://api.etherscan.io/v2/api", {
    params: {
      chainId,
      address: poolAddr,
      module: "account",
      action: "tokenbalance",
      contractaddress: token,
      apikey: process.env.ETHERSCAN_API_KEY,
    },
  });
  return BigInt(result.data.result);
};

const collect = async ({ isCron }: { isCron: boolean }) => {
  console.log("Collecting dex data...");
  const msg: string[][] = [];

  const entries = Object.entries(ADDR_CHAIN_OTHR);
  for (const [address, [chain, usdcAddr, url]] of entries) {
    const chainId = chain.id;
    const gloAddr = getSmartContractAddress(chainId);

    const result = await getPoolData({
      poolAddr: address,
      gloAddr,
      usdcAddr,
      chainId,
    });

    const glo = await fetchBalance(chainId, address, gloAddr);
    const rawUsdc = await fetchBalance(chainId, address, usdcAddr);
    const usdc = chainId === celo.id ? rawUsdc : rawUsdc * BigInt(1e12); // USDC has 6 decimals on most chains, but 18 on Celo
    const sum = glo + usdc;
    msg.push([
      `*<https://${url}/address/${address}|${chain.name}>*`,
      `${result.price}$ - ${result.amountIn} USDGLO -> ${result.amountOut}`,
      `${formatPercent(glo, sum)}% / ${formatPercent(usdc, sum)}%`,
      `USDGLO: ${formatUSD(glo)}`,
      `USDC: ${formatUSD(usdc)}`,
      "\n",
    ]);
    await sleep(1000); // to avoid rate limiting
  }

  const jsonResult = msg.map((elements, index) => ({
    name: entries[index][1][0].name,
    price: elements[1],
    percentage: elements[2],
    USDGLO: elements[3],
    USDC: elements[4],
  }));

  if (isCron) {
    return jsonResult;
  }

  if (process.env.SLACK_WEBHOOK_URL) {
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: msg.flat().join("\n"),
    });
  } else {
    console.warn("SLACK_WEBHOOK_URL not set, skipping Slack notification.");
    console.log(msg.flat().join("\n"));
  }

  return jsonResult;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const formatPercent = (balance: bigint, sum: bigint, fixed = 0) =>
  ((Number(balance) / Number(sum)) * 100).toFixed(fixed);

const formatUSD = (amount: bigint) =>
  "$" +
  Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(formatEther(amount)));

export const getPoolData = async ({
  chainId,
  poolAddr,
  gloAddr,
  usdcAddr,
}: {
  poolAddr: string;
  gloAddr: string;
  usdcAddr: string;
  chainId: number;
}) => {
  const provider = await getJsonProvider(chainId);

  const poolContract = new ethers.Contract(
    poolAddr,
    IUniswapV3PoolABI.abi,
    provider
  );
  const [token0, fee, slot0] = await Promise.all([
    poolContract.token0(),
    poolContract.fee(),
    poolContract.slot0(),
  ]);

  const isGloFirst = token0.toLowerCase() === gloAddr.toLowerCase();

  const balance = await getBalance(poolAddr, chainId);

  const amountIn = balance / BigInt(20); // 5% of the pool balance

  const getQuote = async () => {
    const addr: { [chainId: number]: string } = {
      [base.id]: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
      [celo.id]: "0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8",
    };

    if (chainId in addr) {
      const quoterContractV2 = new ethers.Contract(
        addr[chainId],
        QuoterV2.abi,
        provider
      );

      const quotedAmountOut =
        await quoterContractV2.quoteExactInputSingle.staticCall({
          tokenIn: gloAddr,
          tokenOut: usdcAddr,
          fee,
          amountIn,
          sqrtPriceLimitX96: 0,
        });

      return quotedAmountOut[0];
    }

    const quoterContract = new ethers.Contract(
      "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6", // Quoter V3
      Quoter.abi,
      provider
    );

    const quotedAmountOut =
      await quoterContract.quoteExactInputSingle.staticCall(
        gloAddr,
        usdcAddr,
        fee,
        amountIn,
        0
      );

    return quotedAmountOut;
  };

  const isCelo = chainId === celo.id;
  const usdcDecimals = isCelo ? 18 : 6; // USDC 6, GLO 18
  const sqrtPriceX96 = slot0[0];
  const decimalsDiff = 18 - usdcDecimals;
  const fraction =
    isGloFirst && !isCelo
      ? BigInt(2 ** 96) / BigInt(sqrtPriceX96)
      : BigInt(sqrtPriceX96) / BigInt(2 ** 96);
  const price = fraction ** BigInt(2);

  const quotedAmountOut = await getQuote();

  return {
    price: toDecimals(formatUnits(price.toString(), decimalsDiff), 5),
    amountIn: toDecimals(formatEther(amountIn)),
    amountOut: toDecimals(formatUnits(quotedAmountOut, usdcDecimals)),
  };
};

const toDecimals = (str: string, digits = 2) => {
  const parts = str.split(".");
  return `${parts[0]}.${parts[1]?.slice(0, digits) || 0}`;
};
