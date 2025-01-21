import { ReactNode } from "react";

type ICardName =
  | "TOTAL_TRANSACTIONS"
  | "DOLLAR_HOLDERS"
  | "TOTAL_SUPPLY"
  | "DONATED"
  | "ORG_INTEGRATED";

export type ICard = {
  title: string;
  image: string;
  name: ICardName;
  url: string;
  count?: string;
  formatResult?: (payload: string) => string;
};

export type ITable = {
  title: string;
  headers: string[];
  rowData?: string[][];
  children: ReactNode;
  others?: ReactNode;
};
export type INetworks = "celo" | "ethereum" | "base" | "arbitrum";

export const Networks: Record<INetworks, string> = {
  celo: "Celo",
  ethereum: "Ethereum",
  base: "Base",
  arbitrum: "Arbitrum",
};
