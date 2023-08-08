import { Chain } from "@wagmi/core";

import { getUSDCToUSDGLOUniswapDeeplink } from "./utils";

export const buyWithTransak = (amount: number, address: string) => {
  const redirectUrl = `${window.location.origin}/purchased`;
  const params = `cryptoCurrencyCode=USDC&networks=polygon&fiatCurrency=USD&defaultCryptoAmount=${amount}&walletAddress=${address}&hideMenu=true&redirectURL=${redirectUrl}`;

  window.open(`${process.env.NEXT_PUBLIC_TRANSAK_URL}&${params}`, "_blank");
};

export const buyWithUniswap = (amount: number, chain: Chain) => {
  window.open(getUSDCToUSDGLOUniswapDeeplink(amount, chain), "_blank");
};

export const buyWithCoinbase = () =>
  window.open("https://www.coinbase.com/", "_blank");
