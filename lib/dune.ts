import axios from "axios";

export const fetchTotalHolders = async () => {
  const queryId = 2986620;
  const apiUrl = `https://api.dune.com/api/v1/query/${queryId}/results`;
  const res = await axios.get(apiUrl, {
    headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY },
  });

  const { rows } = res.data.result;

  const row = rows.length ? rows[0] : { distinct_holders: "-" };

  return row.distinct_holders.toString();
};
