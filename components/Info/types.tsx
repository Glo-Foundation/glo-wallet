type IName =
  | "TOTAL_TRANSACTIONS"
  | "DOLLAR_HOLDERS"
  | "TOTAL_SUPPLY"
  | "DONATED"
  | "ORG_INTEGRATED";

export type ICard = {
  title: string;
  image: string;
  name: IName;
  url: string;
  count?: string;
  formatResult?: (payload: string) => string;
};
