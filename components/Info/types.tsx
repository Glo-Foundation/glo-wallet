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
};

export type IFundingSource = {
  possibleFundingChoices: {
    EXTREME_POVERTY: number;
    CLIMATE: number;
    ENDAOMENT: number;
    REFUGEE_CRISIS: number;
    RETRO_PG_OP: number;
    CELO_PG: number;
  };
};
