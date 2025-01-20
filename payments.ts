import { Chain } from "@wagmi/core/chains";

import { getUSDCToUSDGLOSwapDeeplink } from "./utils";

export const buyWithSwap = (amount: number, chain: Chain, dex: string) => {
  window.open(getUSDCToUSDGLOSwapDeeplink(amount, chain, dex), "_blank");
};

export const buyWithStellarX = () =>
  window.open(
    "https://www.stellarx.com/swap/USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN/USDGLO:GBBS25EGYQPGEZCGCFBKG4OAGFXU6DSOQBGTHELLJT3HZXZJ34HWS6XV",
    "_blank"
  );

export const buyWithVerocket = () =>
  window.open("https://app.verocket.com/", "_blank");
