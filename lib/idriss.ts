import { IdrissCrypto } from "idriss-crypto";

export const idriss = new IdrissCrypto(process.env.NEXT_PUBLIC_POLYGON_RPC_URL);
