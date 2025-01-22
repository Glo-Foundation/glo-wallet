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

type CTAType = "JOIN_CONSORTIUM" | "TWEEET_IMPACT" | "REGISTER_IDRISS";

type CTA = {
  type: CTAType;
  isCompleted: boolean;
};

type WC_STATE = "WC_PREP" | "WC_READY" | "STELLAR_PREP" | "STELLAR_READY";
