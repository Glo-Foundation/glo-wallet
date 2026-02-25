import { Charity, CharityChoice } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Chain } from "viem";

import { getBalances } from "@/lib/balance";
import {
  CHARITY_MAP,
  DEFAULT_CHARITY_PER_CHAIN,
  getChainsObjects,
  getMarketCap,
  getStellarMarketCap,
} from "@/lib/utils";
import prisma from "lib/prisma";

// Maps getBalances() return keys to chain names used in getChainsObjects()
const BALANCE_KEY_TO_CHAIN: { [key: string]: string } = {
  polygonBalance: "polygon",
  ethereumBalance: "ethereum",
  celoBalance: "celo",
  optimismBalance: "optimism",
  arbitrumBalance: "arbitrum",
  baseBalance: "base",
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the latest funding choices for all addresses — no date restriction,
  // unlike balanceOnDate.ts which only takes choices made before the current month.
  const allFundingChoices = await prisma.charityChoice.findMany({
    where: {
      address: {
        not: {
          startsWith: "ve",
        },
      },
    },
    distinct: ["address", "name"],
    orderBy: {
      choiceNum: "desc",
    },
  });

  // Group by address and keep only the latest choiceNum per address
  const choicesByAddress = allFundingChoices.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.address]: [...(acc[cur.address] || []), cur],
    }),
    {} as { [key: string]: CharityChoice[] }
  );

  const filteredChoicesByAddress: {
    [key: string]: { name: Charity; percent: number }[];
  } = {};

  for (const address of Object.keys(choicesByAddress)) {
    const choices = choicesByAddress[address];
    const lastChoiceNum = Math.max(...choices.map((x) => x.choiceNum));
    const latestChoices = choices.filter((x) => x.choiceNum === lastChoiceNum);
    if (!latestChoices.length) continue;
    filteredChoicesByAddress[address] = latestChoices.map((x) => ({
      name: x.name,
      percent: x.percent,
    }));
  }

  console.log(
    `currentSnapshot - processing ${
      Object.keys(filteredChoicesByAddress).length
    } addresses`
  );

  // Initialize charity totals and per-chain allocated amounts (all in 18dp)
  const availableChoices = Object.keys(CHARITY_MAP);
  const choices = availableChoices.reduce(
    (acc, cur) => ({ ...acc, [cur]: 0 }),
    {} as { [key: string]: number }
  );

  const chainsObject = getChainsObjects();
  const allocated: { [key: string]: bigint } = {
    ...Object.keys(chainsObject).reduce(
      (acc, cur) => ({ ...acc, [cur]: BigInt(0) }),
      {} as { [key: string]: bigint }
    ),
    stellar: BigInt(0),
  };

  const decimals = BigInt(10 ** 18);

  // For each address, get the current balance and distribute to charities.
  // Unlike balanceOnDate.ts / processAccount.ts, we use the live balance
  // directly instead of computing the 30-day time-weighted average.
  for (const address of Object.keys(filteredChoicesByAddress)) {
    const addressChoices = filteredChoicesByAddress[address];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const balances: any = await getBalances(address);
      let totalBalance18dp = BigInt(0);
      const isStellar = !address.includes("0x");

      if (isStellar) {
        // stellarBalance is in stroop (7dp); multiply by 10^11 to reach 18dp
        const stellarBalance = BigInt(balances.stellarBalance || 0);
        const adjusted = stellarBalance * BigInt(10 ** 11);
        totalBalance18dp += adjusted;
        allocated["stellar"] += adjusted;
      } else {
        // EVM chain balances are already in wei (18dp)
        for (const [key, chainName] of Object.entries(BALANCE_KEY_TO_CHAIN)) {
          const b = BigInt(balances[key] || 0);
          totalBalance18dp += b;
          if (chainName in allocated) {
            allocated[chainName] += b;
          }
        }
      }

      for (const choice of addressChoices) {
        const amount =
          (totalBalance18dp * BigInt(choice.percent)) / BigInt(100) / decimals;
        // Fallback for deleted charities
        const ch = availableChoices.includes(choice.name)
          ? choice.name
          : Charity.OPEN_SOURCE;
        choices[ch] = (choices[ch] || 0) + Number(amount);
      }
    } catch (err) {
      console.error(
        `currentSnapshot - error fetching balance for ${address}:`,
        err
      );
    }
  }

  // Get current (not time-averaged) market caps per chain
  type ChainObject = { id: number; name: string; chain?: Chain };
  const chainObjects: ChainObject[] = Object.entries(chainsObject).map(
    ([key, chain]) => ({ id: chain.id, name: key, chain })
  );
  chainObjects.push({ id: 0, name: "stellar" });

  const marketCaps: { [name: string]: number } = {};
  for (const { id, name, chain } of chainObjects) {
    const marketCap = await (id > 0
      ? getMarketCap(chain!.id)
      : getStellarMarketCap().then(
          // getStellarMarketCap returns whole USDGLO tokens; scale to 18dp
          // to match EVM wei precision (7dp stroop * 10^11 = 18dp)
          (x) => BigInt(x) * BigInt(10 ** 18)
        ));

    const defaultCharity = DEFAULT_CHARITY_PER_CHAIN(id.toString());
    marketCaps[name] = Number(marketCap / BigInt(10 ** 18));
    choices[defaultCharity] += Number(
      (marketCap - allocated[name]) / BigInt(10 ** 18)
    );
  }

  const addTotal = (dict: { [name: string]: number }) => ({
    ...dict,
    _total: Object.values(dict).reduce((acc, cur) => acc + cur, 0),
  });

  return res.status(200).json({
    possibleFundingChoices: addTotal(choices),
    marketCaps: addTotal(marketCaps),
  });
}
