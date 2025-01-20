import axios from "axios";

export type INetworks = "celo" | "eth" | "base" | "bsc" | "arbitrum";
export type IBalance = {
  Balance: string;
  BalanceUpdate: {
    Address: string;
  };
  Currency: {
    Name: string;
    Symbol: string;
  };
};

const getConfig = (data: string) => {
  return {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://streaming.bitquery.io/graphql",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BITQUERY_API_KEY}`,
    },
    data: data,
  };
};

export const getLargestHolders = async (network: INetworks, limit = 10) => {
  const queryData = JSON.stringify({
    query: `query MyQuery {\n  EVM(network: ${network}, dataset: combined) {\n    BalanceUpdates(\n      limit: {count: ${limit}}\n      orderBy: {descendingByField: "Balance"}\n      where: {Currency: {SmartContract: {is: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"}}, ChainId: {}}\n    ) {\n      Balance: sum(of: BalanceUpdate_Amount)\n      Currency {\n        Name\n        Symbol\n      }\n      BalanceUpdate {\n        Address\n      }\n    }\n  }\n}\n`,
    variables: "{}",
  });

  const response = await axios.request(getConfig(queryData));
  const data = response.data.data.EVM.BalanceUpdates as IBalance[];
  return data;
};

export const getLargestMonthlyHolders = async (
  network: INetworks,
  after = "2024-12-01",
  before = "2025-01-01",
  limit = 10
) => {
  const queryData = JSON.stringify({
    query:
      'query GetLargestMontHolder(\n  $network: evm_network, \n  $limit: Int,\n  $after: String,\n  $before: String\n) {\n  EVM(dataset: combined, network: $network) {\n    BalanceUpdates(\n      limit: {count: $limit}\n      orderBy: {descendingByField: "Balance"}\n      where: {Currency: {\n        SmartContract: {\n          is: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"}}, \n        Block: {\n          Date: {\n            after: $after, \n            before:  $before\n          }\n        }\n      }\n    ) {\n      Balance: sum(of: BalanceUpdate_Amount)\n      Currency {\n        Name\n        Symbol\n      }\n      BalanceUpdate {\n        Address\n      }\n    }\n  }\n}\n',
    variables: `{\n  "network": "${network}",\n  "limit": ${limit},\n   "after": "${after}", \n            "before": "${before}"\n}`,
  });

  const response = await axios.request(getConfig(queryData));
  const data = response.data.data.EVM.BalanceUpdates as IBalance[];
  return data;
};
