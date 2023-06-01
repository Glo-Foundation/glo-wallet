type ActionButton = {
  title?: string;
  description: string;
  iconPath: string;
  action: any;
};

type Transfer = {
  from_address: string;
  to_address: string;
  block_timestamp: string;
  value: number;
};

type CTAType = "SHARE_GLO" | "BUY_GLO_MERCH" | "JOIN_PROGRAM";

type CTA = {
  type: CTAType;
};
