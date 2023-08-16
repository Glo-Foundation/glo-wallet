import { Chain } from "@wagmi/core";

import { getUSDCToUSDGLOSwapDeeplink } from "./utils";

export const buyWithTransak = (amount: number, address: string) => {
  const redirectUrl = `${window.location.origin}/purchased`;
  const params = `cryptoCurrencyCode=USDC&networks=polygon&defaultCryptoAmount=${amount}&walletAddress=${address}&hideMenu=true&redirectURL=${redirectUrl}`;

  window.open(`${process.env.NEXT_PUBLIC_TRANSAK_URL}&${params}`, "_blank");
};

export const buyWithSwap = (amount: number, chain: Chain, dex: string) => {
  window.open(getUSDCToUSDGLOSwapDeeplink(amount, chain, dex), "_blank");
};

export const buyWithCoinbase = () =>
  window.open("https://www.coinbase.com/", "_blank");
