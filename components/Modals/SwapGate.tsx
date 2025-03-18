import { useContext } from "react";
import { useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";
import { apiInstance } from "@/lib/utils";
import { buyWithAqua, buyWithBetterSwap } from "@/payments";

import { BuyBox } from "../BuyBox";

import BoxBuyModal from "./BoxBuyModal";
import BuyWithCoinbaseSequenceModal from "./BuyWithCoinbaseSequenceModal";
import SquidModal from "./SquidModal";
import SwapModal from "./SwapModal";

interface Props {
  buyAmount: number;
}

export default function SwapGate(props: Props) {
  const { connector } = useAccount();
  const { openModal } = useContext(ModalContext);

  const buyAmount = props.buyAmount || 1000;

  const isSequenceWallet = connector?.id === "sequence";
  const isMetaMask = connector?.id === "metaMaskSDK";
  const isCoinbaseWallet = connector?.id === "coinbaseWalletSDK";
  const isVe = apiInstance?.defaults.headers["glo-pub-address"]
    ?.toString()
    .startsWith("ve");
  const isWc = connector?.id === "walletConnect";
  const isSafe = connector?.id === "safe";

  if (isSequenceWallet) {
    return <BuyWithCoinbaseSequenceModal buyAmount={buyAmount} />;
  }

  if (isMetaMask || isCoinbaseWallet || isWc || isSafe) {
    return <SwapModal buyAmount={buyAmount} />;
  }

  const BetterSwap = () => (
    <BuyBox
      key="betterswap"
      name="BetterSwap"
      icon="/betterswap.png"
      fees="0.3"
      worksFor="🔐 Crypto"
      delay="⚡ Instant"
      onClick={() => buyWithBetterSwap(buyAmount)}
    />
  );

  if (isVe) {
    return (
      <BoxBuyModal buyAmount={buyAmount}>
        <BetterSwap />
      </BoxBuyModal>
    );
  }

  const isStellar = localStorage.getItem("stellarConnected") == "true";

  if (isStellar) {
    return (
      <BoxBuyModal buyAmount={buyAmount}>
        <BuyBox
          key="aquarius"
          name="Aquarius"
          icon="/aquarius.png"
          fees="0.1"
          worksFor="🔐 XLM"
          delay="⚡ Instant"
          onClick={() => buyWithAqua()}
        />
      </BoxBuyModal>
    );
  }

  // Default option
  return (
    <BoxBuyModal buyAmount={buyAmount}>
      <BetterSwap />
      <BuyBox
        key="squidrouter"
        name="squidrouter"
        icon="/squidrouter.svg"
        fees="0.3"
        worksFor="🔐 Crypto"
        delay="⚡ Instant"
        onClick={() => openModal(<SquidModal buyAmount={buyAmount} />)}
      />
    </BoxBuyModal>
  );
}
