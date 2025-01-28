import { NextApiRequest, NextApiResponse } from "next";
import { cacheExchange, createClient, fetchExchange, gql } from "urql";
import { celo } from "viem/chains";

import { chainConfig } from "@/lib/config";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const { total, details } = await getCeloUniswapLpTVL();

  return res.status(200).json({
    total,
    details: {
      ...details,
    },
  });
}

type ResType = {
  pools: [
    {
      id: string;
      totalValueLockedToken0: string;
      totalValueLockedToken1: string;
      token0: {
        id: string;
        symbol: string;
      };
      token1: {
        id: string;
        symbol: string;
      };
    }
  ];
};

const UNISWAP_V3_SUBPGRAPH = `https://gateway.thegraph.com/api/${process.env.THRGRAPH_API_KEY}/subgraphs/id/ESdrTJ3twMwWVoQ1hUE2u7PugEHX3QkenudD6aXCkDQ4`;

const getCeloUniswapLpTVL = async () => {
  const client = createClient({
    url: UNISWAP_V3_SUBPGRAPH,
    exchanges: [cacheExchange, fetchExchange],
  });

  const gloToken = chainConfig[celo.id].toLowerCase();

  const query = gql`
    query {
      pools(
        where: {
          or: [
            { token0: "${gloToken}" }
            { token1: "${gloToken}" }
          ]
        }
      ) {
        id
        totalValueLockedToken0
        totalValueLockedToken1
        token0 {
            id
            symbol
        }
        token1 {
            id
            symbol
        }
      }
    }
  `;

  const { data } = await client.query<ResType>(query, {}).toPromise();
  const pools = data?.pools;

  const details: { [symbol: string]: number } = {};

  if (!pools) {
    console.error("Could not fetch data from Uniswap subgraph for Celo");
    return { total: 0, details };
  }

  let total = 0;
  pools.forEach((pool) => {
    const [token0, token1] = [pool.token0, pool.token1];
    const [symbol, tvl] =
      token0.id === gloToken
        ? [token1.symbol, pool.totalValueLockedToken0]
        : [token0.symbol, pool.totalValueLockedToken1];
    if (!details[symbol]) {
      details[symbol] = 0;
    }
    const value = Math.round(parseFloat(tvl));
    details[symbol] += value;
    total += value;
  });

  return { total, details };
};
