import { NextApiRequest, NextApiResponse } from "next";
import { cacheExchange, createClient, fetchExchange, gql } from "urql";
import { celo } from "viem/chains";

import { chainConfig } from "@/lib/config";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const uniswapLp = await getCeloUniswapLpTVL();
  const total = uniswapLp;

  return res.status(200).json({
    total,
    details: {
      uniswapLp,
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
      };
      token1: {
        id: string;
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

  if (!pools) {
    console.error("Could not fetch data from Uniswap subgraph for Celo");
    return 0;
  }

  const lockedGlo = pools.map((pool) =>
    pool.token0.id === gloToken
      ? pool.totalValueLockedToken0
      : pool.totalValueLockedToken1
  );
  const sumLockedGlo = Math.round(
    lockedGlo.reduce((acc: number, cur: string) => acc + parseFloat(cur), 0)
  );

  return sumLockedGlo;
};
