const { NEXT_PUBLIC_URL } = process.env;

export const isTestnetProd = () =>
  NEXT_PUBLIC_URL === "https://testnet.glodollar.org";
export const isTestnetDev = () =>
  NEXT_PUBLIC_URL === "https://testnet.glodollar.org";

export const isMainnetProd = () =>
  NEXT_PUBLIC_URL === "https://wallet.glodollar.org";
export const isMainnetDev = () =>
  NEXT_PUBLIC_URL === "https://wallet.glodollar.org";

export const isLocal = () => NEXT_PUBLIC_URL!.includes("http://localhost");
