type ActionButton = {
  title?: string;
  description: string;
  iconPath: string;
  action: any;
};

type Transfer = {
  type: string;
  ts: string;
  value: number | string;
  from: string;
  to: string;
};

type CTAType = "SHARE_GLO" | "BUY_GLO_MERCH" | "JOIN_PROGRAM";

type CTA = {
  type: CTAType;
};
