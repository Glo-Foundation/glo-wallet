import { IdrissCrypto } from "idriss-crypto";

export const idriss = new IdrissCrypto(process.env.NEXT_PUBLIC_POLYGON_RPC_URL);

export const isIdriss = async (address: string) => {
  const result = await getIdrissName(address);
  return !!result;
};

export const getIdrissName = async (address: string) =>
  idriss.reverseResolve(address);
