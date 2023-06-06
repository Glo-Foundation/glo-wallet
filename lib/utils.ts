import { ConnectDetails } from "0xsequence/dist/declarations/src/provider";
import axios, { AxiosInstance } from "axios";

export const sliceAddress = (address: string) =>
  `${address?.slice(0, 5)}...${address?.slice(-3)}`;

export let apiInstance: AxiosInstance;

export const initApi = async (address: string) => {
  const details: ConnectDetails = JSON.parse(
    localStorage.getItem("glo-wallet")!
  );

  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL: "/api/",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${details.proof?.proofString}`,
        "glo-pub-address": address,
      },
    });
  }
  return apiInstance;
};

export const api = () => apiInstance;

export const isProd = () => process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
