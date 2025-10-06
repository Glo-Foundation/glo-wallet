import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { Chain, formatEther } from "viem";
import { arbitrum, base, celo, mainnet, optimism, polygon } from "viem/chains";

import { chainConfig } from "@/lib/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // const authHeader = req.headers["authorization"];
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }

  await collect();

  return res.status(200).json({ message: "Data collection completed." });
}

const ADDR_CHAIN_OTHR: { [poolAddr: string]: [Chain, string] } = {
  "0x13c6656a9a7c136ab651fa331e9264223f5bf9e4": [
    mainnet,
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  ],
  "0x98c3648a2087df2a1c2a5b695de908bf95fa4f39": [
    optimism,
    "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  ],
  "0x6db8d9d795c053ad0fd24723320e47b2a21c3dc1": [
    base,
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  ],
  "0x180bcf9197bce5a94b629289c7cd5c25329ab1c7": [
    polygon,
    "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  ],
  "0x20f960d5b11d7b35072a38abff28ab882824c9b8": [
    arbitrum,
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  ],
  "0x7b9a5bc920610f54881f2f6359007957de504862": [
    celo,
    "0x765DE816845861e75A25fCA122bb6898B8B1282a",
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

const collect = async () => {
  console.log("Collecting dex data...");
  const msg: string[] = [];

  for (const [address, [chain, usdcAddr]] of Object.entries(ADDR_CHAIN_OTHR)) {
    const chainId = chain.id;
    const glo = await fetchBalance(chainId, address, chainConfig[chainId]);
    const rawUsdc = await fetchBalance(chainId, address, usdcAddr);
    const usdc = chainId === celo.id ? rawUsdc : rawUsdc * BigInt(1e12); // USDC has 6 decimals on most chains, but 18 on Celo
    const sum = glo + usdc;
    msg.push(
      ...[
        `*${chain.name}*`,
        `${formatPercent(glo, sum)}% / ${formatPercent(usdc, sum)}%`,
        `USDGLO: ${formatUSD(glo)}`,
        `USDC: ${formatUSD(usdc)}\n`,
      ]
    );
    await sleep(500); // to avoid rate limiting
  }

  if (!process.env.SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL not set, skipping Slack notification.");
    console.log(msg.join("\n"));
    return;
  }

  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    text: msg.join("\n"),
  });
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
