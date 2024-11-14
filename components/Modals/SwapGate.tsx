import { useAccount } from "wagmi";

import BuyWithCoinbaseSequenceModal from "./BuyWithCoinbaseSequenceModal";
import StellarBuyModal from "./StellarBuyModal";
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

  if (isSequenceWallet) {
    return <BuyWithCoinbaseSequenceModal buyAmount={buyAmount} />;
  }

  if (isMetaMask || isCoinbaseWallet) {
    return <SwapModal buyAmount={buyAmount} />;
  }

  const isStellar = !address?.startsWith("0x");
  console.log({ isStellar, address });
  if (isStellar) {
    return <StellarBuyModal buyAmount={buyAmount} />;
  }

  return <>Not supported wallet</>;
}
