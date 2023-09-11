import { IdrissCrypto } from "idriss-crypto";

const idriss = new IdrissCrypto();

export const isIdriss = async (address: string) => {
  const result = await getIdrissName(address);
  return !!result;
};

export const getIdrissName = async (address: string) =>
  idriss.reverseResolve(address);
