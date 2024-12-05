import axios from "axios";

export const fetchTotalHolders = async () => {
  const queryId = 3299607;
  const apiUrl = `https://api.dune.com/api/v1/query/${queryId}/results`;
  const res = await axios.get(apiUrl, {
    headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY },
  });

  const { rows } = res.data.result;

  const row = rows.length ? rows[0] : { distinct_holders: "-" };

  return row.distinct_holders.toString();
};

export const fetchTotalTransactions = async () => {
  const queryId = 3993980;
  const apiUrl = `https://api.dune.com/api/v1/query/${queryId}/results`;
  const res = await axios.get(apiUrl, {
    headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY },
  });

  const { rows } = res.data.result;

  const row = rows.length ? rows[0] : { total_usdglo_transactions: "-" };

  return row.total_usdglo_transactions.toString();
};

export const fetchLeaderboard = async () => {
  const queryId = 4322866;
  const apiUrl = `https://api.dune.com/api/v1/query/${queryId}/results`;
  const res = await axios.get(apiUrl, {
    headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY },
  });

  const { rows } = res.data.result;

  const row = rows.length ? rows : [];

  // return row;
  return row as {
    amount: number;
    blockchain: string;
    tx_from: string;
    tx_to: string;
  }[];
};

export const fetchLeaderboardForMonth = async () => {
  const queryId = 4375381;

  const apiUrl = `https://api.dune.com/api/v1/query/${queryId}/results`;
  const res = await axios.get(apiUrl, {
    headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY },
    params: {
      limit: 10,
      filters: "block_month > '2024-02-01'",
    },
  });

  const { rows } = res.data.result;

  const row = rows.length ? rows : [];

  return row as {
    amount: number;
    block_date: string;
    block_month: string;
    blockchain: string;
    tx_from: string;
    tx_to: string;
  }[];
};
