import axios from "axios";

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
export const fetchLargestHolder = async () => {
  const queryId = 4593240;

  const row = await _getDuneQuery({
    queryId,
    params: {
      "Chain For Token A No1": "base",
      "Token A No1 Address": "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3",
      "Token A No1 Held More Than": 2,
    },
  });

  // console.log("fetchLargestHolder Rows: ", row);
  return row as ILargestHolder[];
};

export type ILargestMonthlyHolder = {
  tx_from: string;
  token_a_symbol: string;
  avg_monthly_balance: number;
  token_a_value_avg: number;
};
export const fetchLargestHoldersForPastMonth = async () => {
  const queryId = 4594378;

  const row = await _getDuneQuery({
    queryId,
    params: {
      "Chain For Token A No1": "celo",
      "Token A No1 Address": "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3",
      "Token A No1 Held More Than": 2,
    },
  });

  console.log("fetchLargestHoldersForPastMonth Rows: ", row);

  return row as ILargestMonthlyHolder[];
};
