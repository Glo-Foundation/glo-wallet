import { IdrissCrypto } from "idriss-crypto";

const idriss = new IdrissCrypto();

export const isIdriss = async (address: string) => {
  const result = await idriss.reverseResolve(address);
  return !!result;
};
