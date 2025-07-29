import { Chain } from "viem";

import { api } from "@/lib/utils";

export const getCurrentSelectedCharity = async () => {
  let apiInstance = api();
  if (!apiInstance) {
    // HACK: some race condition with the api instance
    await new Promise((res) => setTimeout(res, 1000));
    apiInstance = api();
  }
  return apiInstance.get(`/charity`).then((res) => res.data);
};

const getChainName = (chain?: Chain) => {
  const name = chain?.name.toLowerCase() || "";

  const chainMap: { [key: string]: string } = {
    "op mainnet": "optimism",
    "arbitrum one": "arbitrum",
  };
  return chainMap[name] || name;
};

export const getCoinbaseSessionToken = async (chain?: Chain) => {
  const {
    data: { sessionToken },
  } = await api().get<{ sessionToken: string }>(
    `/coinbase/session-token/${getChainName(chain)}`
  );

  return sessionToken;
};
