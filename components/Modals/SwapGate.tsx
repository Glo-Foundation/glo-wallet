import { useAccount } from "wagmi";

import { apiInstance } from "@/lib/utils";
import { buyWithStellarX, buyWithVerocket } from "@/payments";

import { BuyBox } from "../BuyBox";

import BoxBuyModal from "./BoxBuyModal";
import BuyWithCoinbaseSequenceModal from "./BuyWithCoinbaseSequenceModal";
import SwapModal from "./SwapModal";

interface Props {
  buyAmount: number;
}

export default function SwapGate(props: Props) {
  const { address, connector } = useAccount();
  const buyAmount = props.buyAmount || 100;

  const isSequenceWallet = connector?.id === "sequence";
  const isMetaMask = connector?.id === "metaMaskSDK";
  const isCoinbaseWallet = connector?.id === "coinbaseWalletSDK";
  const isVe = apiInstance?.defaults.headers["glo-pub-address"]
    ?.toString()
    .startsWith("ve");

  if (isSequenceWallet) {
    return <BuyWithCoinbaseSequenceModal buyAmount={buyAmount} />;
  }

  if (isMetaMask || isCoinbaseWallet) {
    return <SwapModal buyAmount={buyAmount} />;
  }

  if (isVe) {
    return (
      <BoxBuyModal buyAmount={buyAmount}>
        <BuyBox
          key="verocket"
          name="Verocket"
          icon="/verocket.png"
          fees="0.3"
          worksFor="🔐 Crypto"
          delay="⚡ Instant"
          onClick={() => buyWithVerocket()}
        />
      </BoxBuyModal>
    );
  }

  const isStellar = !address?.startsWith("0x");
  if (isStellar) {
    return (
      <BoxBuyModal buyAmount={buyAmount}>
        <BuyBox
          key="stellarx"
          name="StellarX"
          icon="/stellarx.png"
          fees="0.1"
          worksFor="🔐 XLM"
          delay="⚡ Instant"
          onClick={() => buyWithStellarX()}
        />
      </BoxBuyModal>
    );
  }

  return <>Not supported wallet</>;
}
