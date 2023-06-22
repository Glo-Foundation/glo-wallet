import axios, { AxiosInstance } from "axios";

export const sliceAddress = (address: string, amt = 3) =>
  `${address?.slice(0, amt + 2)}...${address?.slice(amt * -1)}`;

export let apiInstance: AxiosInstance;
let apiInstanceWallet = "";

export const initApi = async (
  address: string,
  chainId: number,
  signature: string
) => {
  if (!apiInstance || apiInstanceWallet !== address) {
    apiInstanceWallet = address;
    apiInstance = axios.create({
      baseURL: "/api/",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${signature}`,
        "glo-pub-address": address,
        "glo-chain-id": chainId,
      },
    });
  }
  return apiInstance;
};

export const api = () => apiInstance;

export const isProd = () => process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export const signMsgContent = "glo-wallet";

export const DEFAULT_CTAS: CTA[] = [
  "SHARE_GLO",
  "BUY_GLO_MERCH",
  "JOIN_PROGRAM",
  "TWEEET_IMPACT",
].map((cta) => ({ type: cta } as CTA));
