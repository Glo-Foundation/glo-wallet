import axios from "axios";

import { INetworks } from "@/components/Info/types";

const _getDuneQuery = async (props: {
  queryId: number;
  params?: Record<string, unknown>;
}) => {
  const apiUrl = `https://api.dune.com/api/v1/query/${props.queryId}/results`;
  const res = await axios.get(apiUrl, {
    headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY },
    params: props.params,
  });

  const { rows } = res.data.result;

  return rows.length ? rows : [];
};

export const fetchTotalHolders = async () => {
  const queryId = 3299607;

  const rows = await _getDuneQuery({ queryId });

  const row = rows.length ? rows[0] : { distinct_holders: "-" };

  return row.distinct_holders.toString();
};

export const fetchTotalTransactions = async () => {
  const queryId = 3993980;

  const rows = await _getDuneQuery({ queryId });

  const row = rows.length ? rows[0] : { total_usdglo_transactions: "-" };

  return row.total_usdglo_transactions.toString();
};

export type ILargestHolder = {
  token_a_held: number;
  token_a_symbol: string;
  token_a_value_held: number;
  tx_from: string;
};

export const fetchLargestHolder = async (network?: INetworks) => {
  const networkQueries: Record<INetworks, number> = {
    celo: 4603891,
    ethereum: 4603896,
    base: 4603900,
    optimism: 4603907,
    arbitrum: 4603904,
  };

  const row = await _getDuneQuery({
    queryId: !!network ? networkQueries[network] : 4603891,
    params: {
      limit: 10,
    },
  });

  return row as ILargestHolder[];
};

export type ILargestMonthlyHolder = {
  tx_from: string;
  token_a_symbol: string;
  avg_monthly_balance: number;
  token_a_value_avg: number;
};

export const fetchLargestHoldersForPastMonth = async (network?: INetworks) => {
  const networkQueries: Record<INetworks, number> = {
    ethereum: 4600571,
    celo: 4604034,
    base: 4604058,
    optimism: 4604051,
    arbitrum: 4604061,
  };

  const row = await _getDuneQuery({
    queryId: !!network ? networkQueries[network] : 4600571,
    params: {
      limit: 10,
    },
  });

  return row as ILargestMonthlyHolder[];
};
