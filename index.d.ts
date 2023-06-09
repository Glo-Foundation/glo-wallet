type ActionButton = {
  title?: string;
  description: string;
  iconPath: string;
  action?: any;
  disabled?: boolean;
  url?: string;
  slug?: string;
  action?: () => void;
};

type Transfer = {
  type: string;
  ts: string;
  value: number | string;
  from: string;
  to: string;
  hash: string;
};

type TransfersPage = {
  transfers: Transfer[];
  cursor?: string;
};

type CTAType = "SHARE_GLO" | "BUY_GLO_MERCH" | "JOIN_PROGRAM" | "TWEEET_IMPACT";

type CTA = {
  type: CTAType;
  isCompleted: boolean;
};
