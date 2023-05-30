/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPublicCompressed } from "@toruslabs/eccrypto";
import { OPENLOGIN_NETWORK_TYPE } from "@toruslabs/openlogin";
import { WALLET_ADAPTERS } from "@web3auth/base";
import axios, { AxiosInstance } from "axios";

import { web3AuthInstance } from "./web3uath";

export const sliceAddress = (address: string) =>
  `${address?.slice(0, 5)}...${address?.slice(-3)}`;

export let apiInstance: AxiosInstance;

const getUserToken = async () => {
  const userInfo = await web3AuthInstance.getUserInfo();
  if (userInfo.idToken) {
    return userInfo.idToken;
  }
  const user = await web3AuthInstance.authenticateUser();
  return user.idToken;
};

const getPubKey = async () => {
  try {
    const app_scoped_privkey = (await web3AuthInstance.provider?.request({
      method: "eth_private_key",
    })) as string;

    const app_pub_key = getPublicCompressed(
      Buffer.from(app_scoped_privkey.padStart(64, "0"), "hex")
    ).toString("hex");

    return app_pub_key;
  } catch {
    return null;
  }
};

const isExternalWallet = () =>
  WALLET_ADAPTERS.OPENLOGIN !== web3AuthInstance.connectedAdapterName;

export const initApi = async (address: string) => {
  if (!apiInstance) {
    const userToken = await getUserToken();
    const appPubKey = !isExternalWallet() ? await getPubKey() : null;

    apiInstance = axios.create({
      baseURL: "/api/",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
        "glo-app-pub-key": appPubKey,
        "glo-pub-address": address,
      },
    });
  }
  return apiInstance;
};

export const api = () => apiInstance;

export const isProd = () => process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export const getNetwork = (): OPENLOGIN_NETWORK_TYPE =>
  isProd() ? "mainnet" : "testnet";
