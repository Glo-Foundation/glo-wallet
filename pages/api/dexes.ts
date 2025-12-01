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

const ADDR_CHAIN_OTHR: {
  poolAddr: string;
  chain: Chain;
  otherAddr: string;
  name?: string;
  v2Quouter?: string;
  decimals?: number;
}[] = [
  {
    poolAddr: "0x13c6656a9a7c136ab651fa331e9264223f5bf9e4",
    chain: mainnet,
    otherAddr: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  {
    poolAddr: "0x98c3648a2087df2a1c2a5b695de908bf95fa4f39",
    chain: optimism,
    otherAddr: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  },
  {
    poolAddr: "0x180bcf9197bce5a94b629289c7cd5c25329ab1c7",
    chain: polygon,
    otherAddr: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  },
  {
    poolAddr: "0x20f960d5b11d7b35072a38abff28ab882824c9b8",
    chain: arbitrum,
    otherAddr: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  },
  {
    poolAddr: "0x6DB8d9D795C053ad0fd24723320E47b2a21c3dC1",
    chain: base,
    otherAddr: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    v2Quouter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
  },
  {
    poolAddr: "0x28ade0134b9d0bc7041f4e5ea74fecb58504720b",
    chain: celo,
    otherAddr: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    v2Quouter: "0xA8864a18Fab1ED233Ce1921F329A6A92DBccA56f",
    name: "Celo (USDC)",
  },
  {
    poolAddr: "0xC1f7313d996b740E8740eF49Add3177535431a72",
    chain: celo,
    otherAddr: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    v2Quouter: "0xA8864a18Fab1ED233Ce1921F329A6A92DBccA56f",
    name: "Celo (USDC)",
  },
];

const SCANNERS: { [key: string]: string } = {
  [celo.name]: "celoscan.io",
  [mainnet.name]: "etherscan.io",
  [optimism.name]: "optimistic.etherscan.io",
  [base.name]: "basescan.org",
  [polygon.name]: "polygonscan.com",
  [arbitrum.name]: "arbiscan.io",
};

const ALCHEMY_NAMES: { [key: string]: string } = {
  [mainnet.name]: "eth",
  [optimism.name]: "opt",
  [arbitrum.name]: "arb",
};

const fetchAlchemyBalances = async ({
  poolAddr,
  chainName,
  gloAddr,
  otherAddr,
}: {
  poolAddr: string;
  chainName: string;
  gloAddr: string;
  otherAddr: string;
}): Promise<[bigint, bigint]> => {
  const res = await axios.post(
    `https://${
      ALCHEMY_NAMES[chainName] || chainName
    }-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    {
      jsonrpc: "2.0",
      method: "alchemy_getTokenBalances",
      params: [poolAddr, [gloAddr, otherAddr]],
      id: 1,
    }
  );
  const resultMap = res.data.result.tokenBalances.reduce(
    (
      acc: { [key: string]: string },
      cur: { contractAddress: string; tokenBalance: string }
    ) => ({
      ...acc,
      [cur.contractAddress]: BigInt(cur.tokenBalance),
    }),
    {} as { [key: string]: string }
  );

  return [resultMap[gloAddr] || BigInt(0), resultMap[otherAddr] || BigInt(0)];
};

const collect = async ({ isCron }: { isCron: boolean }) => {
  console.log("Collecting dex data...");
  const msg: string[][] = [];

  for (const {
    poolAddr,
    chain,
    otherAddr,
    v2Quouter,
    decimals,
    name,
  } of ADDR_CHAIN_OTHR) {
    const chainId = chain.id;
    const gloAddr = getSmartContractAddress(chainId);
    const url = SCANNERS[chain.name];

    const result = await getPoolData({
      poolAddr,
      gloAddr,
      otherAddr,
      chainId,
      v2Quouter,
      decimals,
    });

    const [glo, rawUsdc] = await fetchAlchemyBalances({
      poolAddr,
      chainName: chain.name,
      gloAddr,
      otherAddr,
    });

    const usdc = decimals == 18 ? rawUsdc : rawUsdc * BigInt(1e12); // USDC has 6 decimals on most chains, but 18 on Celo (cUSD)
    const sum = glo + usdc;
    msg.push([
      `https://${url}/address/${poolAddr}-${name || chain.name}`,
      `${result.price}$`,
      `${result.amountIn} USDGLO -> ${result.amountOut} USDC`,
      `${formatPercent(glo, sum)}% / ${formatPercent(usdc, sum)}%`,
      `USDGLO: ${formatUSD(glo)}`,
      `USDC: ${formatUSD(usdc)}`,
    ]);
    await sleep(1000); // to avoid rate limits
  }

  const entries = Object.values(ADDR_CHAIN_OTHR);
  const jsonResult = msg.map((elements, index) => ({
    name: entries[index]?.name || entries[index].chain.name,
    price: elements[1],
    inout: elements[2],
    percentage: elements[3],
    USDGLO: elements[4],
    USDC: elements[5],
  }));

  if (!isCron) {
    return jsonResult;
  }

  if (process.env.SLACK_WEBHOOK_URL) {
    const rows = msg.map((row) =>
      row.map((text, index) =>
        index
          ? {
              type: "raw_text",
              text,
            }
          : {
              type: "rich_text",
              elements: [
                {
                  type: "rich_text_section",
                  elements: [
                    {
                      text: text.split("-")[1].trim(),
                      type: "link",
                      url: text.split("-")[0].trim(),
                    },
                  ],
                },
              ],
            }
      )
    );
    await axios.post(process.env.SLACK_WEBHOOK_URL!, {
      blocks: JSON.stringify([
        {
          type: "context",
          elements: [
            {
              type: "plain_text",
              text: `DEX Pool Updates - ${new Date().toLocaleString("en-GB", {
                timeZone: "Europe/Paris",
              })} Europe/Paris`,
            },
          ],
        },
        {
          type: "table",
          column_settings: [{ is_wrapped: true }, { align: "right" }],
          rows,
        },
      ]),
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
  otherAddr,
  v2Quouter,
  decimals,
}: {
  poolAddr: string;
  gloAddr: string;
  otherAddr: string;
  chainId: number;
  v2Quouter?: string;
  decimals?: number;
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
    if (v2Quouter) {
      const quoterContractV2 = new ethers.Contract(
        v2Quouter,
        QuoterV2.abi,
        provider
      );

      const quotedAmountOut =
        await quoterContractV2.quoteExactInputSingle.staticCall({
          tokenIn: gloAddr,
          tokenOut: otherAddr,
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
        otherAddr,
        fee,
        amountIn,
        0
      );

    return quotedAmountOut;
  };

  const usdcDecimals = decimals || 6;
  const sqrtPriceX96 = slot0[0];
  const decimalsDiff = 18 - usdcDecimals;
  const fraction = isGloFirst
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
