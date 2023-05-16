import axios, { AxiosInstance } from "axios";
import {
  EvmChain,
  EvmErc20TransferJSON,
  EvmErc20TransfersResponseJSON,
} from "moralis/common-evm-utils";

let axiosClient: AxiosInstance;

const getAxiosClient = () => {
  if (axiosClient) {
    return axiosClient;
  }
  axiosClient = axios.create({
    baseURL: "https://deep-index.moralis.io/api/v2/",
    headers: {
      accept: "application/json",
      "X-API-Key": process.env.MORALIS_API_KEY,
    },
  });

  return axiosClient;
};

// https://docs.moralis.io/web3-data-api/reference/get-erc20-transfers
export const fetchTransactions = async (
  address: string,
  chain: string = EvmChain.MUMBAI.apiHex,
  limit = 5
): Promise<Transfer[]> => {
  const transfers = await getAxiosClient().get<EvmErc20TransfersResponseJSON>(
    `erc20/transfers?contract_addresses%5B0%5D=${process.env.NEXT_PUBLIC_USDGLO}&wallet_addresses%5B0%5D=${address}&chain=${chain}&limit=${limit}`
  );

  return (
    transfers.data.result?.map((tx: EvmErc20TransferJSON) => ({
      type:
        tx.from_wallet.toLowerCase() === address.toLowerCase()
          ? "outgoing"
          : "incoming",
      ts: tx.block_timestamp,
      value: tx.value_decimal,
    })) || []
  );
};
