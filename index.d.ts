type ActionButton = {
  title?: string;
  description: string;
  iconPath: string;
  action: any;
};

type Transfer = {
  type: string;
  ts: string;
  value: string;
  from: string;
  to: string;
};
