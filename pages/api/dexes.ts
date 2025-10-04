import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { formatEther } from "viem";
import { arbitrum, base, celo, mainnet, optimism, polygon } from "viem/chains";

import { chainConfig } from "@/lib/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const authHeader = req.headers["authorization"];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await collect();

  return res.status(200).json({ message: "Data collection completed." });
}

const ADDR_CHAIN = {
  "0x13c6656a9a7c136ab651fa331e9264223f5bf9e4": mainnet,
  "0x98c3648a2087df2a1c2a5b695de908bf95fa4f39": optimism,
  "0x6db8d9d795c053ad0fd24723320e47b2a21c3dc1": base,
  "0x180bcf9197bce5a94b629289c7cd5c25329ab1c7": polygon,
  "0x20f960d5b11d7b35072a38abff28ab882824c9b8": arbitrum,
  "0x7b9a5bc920610f54881f2f6359007957de504862": celo,
};

const collect = async () => {
  console.log("Collecting dex data...");
  const balances: { [chain: string]: bigint } = {};

  for (const [address, chain] of Object.entries(ADDR_CHAIN)) {
    const chainId = chain.id;
    const result = await axios.get(" https://api.etherscan.io/v2/api", {
      params: {
        chainId,
        address,
        module: "account",
        action: "tokenbalance",
        contractaddress: chainConfig[chainId],
        apikey: process.env.ETHERSCAN_API_KEY,
      },
    });
    balances[chain.name] = BigInt(result.data.result);

    await sleep(200); // to avoid rate limiting
  }

  const sum = Object.values(balances).reduce((a, b) => a + b, BigInt(0));
  const msg = [`Total dex balance: ${formatUSD(sum)}`];
  for (const [chain, balance] of Object.entries(balances).sort((a, b) =>
    Number(b[1] - a[1])
  )) {
    msg.push(
      `${chain} - ${((Number(balance) / Number(sum)) * 100).toFixed(
        1
      )}% (${formatUSD(balance)})`
    );
  }

  if (!process.env.SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL not set, skipping Slack notification.");
    return;
  }

  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    text: msg.join("\n"),
  });
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatUSD(amount: bigint) {
  return (
    "$" +
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(formatEther(amount)))
  );
}
