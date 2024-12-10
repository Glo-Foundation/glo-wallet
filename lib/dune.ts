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

export const fetchLeaderboard = async () => {
  const queryId = 4322866;

  const row = await _getDuneQuery({ queryId });

  return row as {
    amount: number;
    blockchain: string;
    tx_from: string;
    tx_to: string;
  }[];
};

export const fetchLeaderboardForMonth = async () => {
  const queryId = 4375381;

  const row = await _getDuneQuery({
    queryId,
    params: {
      limit: 10,
      filters: "block_month > '2024-02-01'",
    },
  });

  return row as {
    amount: number;
    block_date: string;
    block_month: string;
    blockchain: string;
    tx_from: string;
    tx_to: string;
  }[];
};
