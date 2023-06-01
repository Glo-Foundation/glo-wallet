import axios, { AxiosInstance } from "axios";

export const sliceAddress = (address: string) =>
  `${address?.slice(0, 5)}...${address?.slice(-3)}`;

export let apiInstance: AxiosInstance;

// const isExternalWallet = () =>
// WALLET_ADAPTERS.OPENLOGIN !== web3AuthInstance.connectedAdapterName;

export const initApi = async (address: string) => {
  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL: "/api/",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${userToken}`,
        // "glo-app-pub-key": appPubKey,
        "glo-pub-address": address,
      },
    });
  }
  return apiInstance;
};

export const api = () => apiInstance;

export const isProd = () => process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
