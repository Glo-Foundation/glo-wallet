import { Chain } from "@wagmi/core/chains";

import { getUSDCToUSDGLOSwapDeeplink } from "./utils";

export const buyWithSwap = (amount: number, chain: Chain, dex: string) => {
  window.open(getUSDCToUSDGLOSwapDeeplink(amount, chain, dex), "_blank");
};

export const buyWithAqua = () =>
  window.open(
    "https://aqua.network/swap/USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN/USDGLO:GBBS25EGYQPGEZCGCFBKG4OAGFXU6DSOQBGTHELLJT3HZXZJ34HWS6XV",
    "_blank"
  );

export const buyWithBetterSwap = () =>
  window.open(
    "https://www.betterswap.io/?tokenIn=native&tokenOut=0x29c630cce4ddb23900f5fe66ab55e488c15b9f5e",
    "_blank"
  );
