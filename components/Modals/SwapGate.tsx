import { useContext } from "react";
import { useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";
import { apiInstance } from "@/lib/utils";
import { buyWithAqua, buyWithVerocket } from "@/payments";

import { BuyBox } from "../BuyBox";

import BoxBuyModal from "./BoxBuyModal";
import BuyWithCoinbaseSequenceModal from "./BuyWithCoinbaseSequenceModal";
import SquidModal from "./SquidModal";
import SwapModal from "./SwapModal";
import SellGloModal from "./SellGloModal";

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
      <BuyBox
        key="verocket"
        name="Verocket"
        icon="/verocket.png"
        fees="0.3"
        worksFor="🔐 Crypto"
        delay="⚡ Instant"
        onClick={() => buyWithVerocket()}
      />
      <BuyBox
        key="squidrouter"
        name="squidrouter"
        icon="/squidrouter.svg"
        fees="0.3"
        worksFor="🔐 Crypto"
        delay="⚡ Instant"
        onClick={() => openModal(<SquidModal buyAmount={buyAmount} />)}
      />
      <BuyBox
        key="peanut"
        name="Peanut"
        icon="/peanut.png"
        fees="0.5"
        worksFor="💳 Card"
        delay="⚡ Instant"
        onClick={() => window.open("https://peanut.to/cashout", "_blank")}
      />
      <BuyBox
        key="offramp"
        name="Offramp"
        icon="/offramp.png"
        fees="0.5"
        worksFor="💳 Card"
        delay="⚡ Instant"
        onClick={() => window.open("https://www.offramp.xyz/", "_blank")}
      />
      <BuyBox
        key="sell"
        name="Sell Glo"
        icon="/sell.svg"
        fees="0.5"
        worksFor="💳 Card"
        delay="⚡ Instant"
        onClick={() => openModal(<SellGloModal />)}
      />
    </BoxBuyModal>
  );
}
