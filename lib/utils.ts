export const sliceAddress = (address: string) =>
  `${address?.slice(0, 5)}...${address?.slice(-3)}`;
