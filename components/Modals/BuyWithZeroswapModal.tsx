import { sequence } from "0xsequence";
import { polygon } from "@wagmi/core/chains";
import Image from "next/image";
import { useState, useEffect, useContext } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";

import StepCard from "@/components/Modals/StepCard";
import { getSmartContractAddress } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { buyWithSwap } from "@/payments";

import PaymentOptionModal from "./PaymentOptionModal";

interface Props {
  buyAmount: number;
}
export default function BuyWithZeroswapModal({ buyAmount }: Props) {
  const { address, connector } = useAccount();
  const { openModal, closeModal } = useContext(ModalContext);

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const [isCopiedStepDone, setIsCopiedStepDone] = useState(false);
  const [isSwapStepDone, setIsSwapStepDone] = useState(false);
  const [isSequenceStepDone, setIsSequenceStepDone] = useState(false);
  const [isConnectWalletDone, setIsConnectWalletDone] = useState(false);
  const [openedZeroswap, setOpenedZeroswap] = useState(false);

  const userIsOnPolygon = chain?.id === polygon.id;
  const isSequenceWallet = connector?.id === "sequence";

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 1000);
    }
  }, [isCopiedTooltipOpen]);

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-2">
      {" "}
      <header className="flex flex-row justify-between p-3">
        <Image
          src="/arrow-right.svg"
          width={25}
          height={25}
          alt="arrow-right"
          className="flex w-25px max-w-25px h-25px max-h-25px scale-x-[-1] cursor-pointer -translate-x-1"
          onClick={() =>
            openModal(<PaymentOptionModal buyAmount={buyAmount} />)
          }
        />
        <Tooltip id="copy-tooltip" isOpen={isCopiedTooltipOpen} />
        <button
          className="copy cursor-pointer border-2 rounded-full border-cyan-200 px-3 py-1"
          data-tooltip-id="copy-tooltip"
          data-tooltip-content="Copied!"
          onClick={() => {
            navigator.clipboard.writeText(address!);
            setIsCopiedTooltipOpen(true);
          }}
        >
          🔗 {sliceAddress(address!)}
        </button>
        <button onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </header>
      <h2 className="text-center">Buy Glo Dollars through Zeroswap</h2>
      <section>
        <StepCard
          index={1}
          iconPath="/polygon.svg"
          title={"Switch to the Polygon network"}
          content="Please confirm the switch in your wallet"
          action={() => {
            switchNetwork!(polygon.id);
          }}
          done={userIsOnPolygon}
        />
        <StepCard
          index={2}
          iconPath="/zeroswap.svg"
          title={"Connect wallet on Zeroswap"}
          content={
            isSequenceWallet
              ? `Choose WalletConnect and click `
              : `Connect your wallet and click \"Swap\"`
          }
          action={() => {
            chain && buyWithSwap(buyAmount, chain, "Zeroswap");
            setOpenedZeroswap(true);
          }}
          done={openedZeroswap}
        />
        {isSequenceWallet ? (
          <StepCard
            index={3}
            iconPath="/sequence.svg"
            title="Connect to the Sequence wallet"
            content="Paste the code into the wallet's scanner"
            action={() => {
              const wallet = sequence.getWallet();
              wallet.openWallet("/wallet/scan");
              setIsSequenceStepDone(true);
            }}
            done={isSequenceStepDone}
          />
        ) : (
          <StepCard
            index={3}
            iconPath="/walletconnect.svg"
            title="Connect to your wallet"
            content={
              isSequenceWallet
                ? `Choose WalletConnect and click `
                : `Connect your wallet`
            }
            action={() => {
              setIsConnectWalletDone(true);
            }}
            done={isConnectWalletDone}
            isSequenceWallet={isSequenceWallet}
          />
        )}
        <div data-tooltip-id="copy-tooltip" data-tooltip-content="Copied!">
          <StepCard
            index={4}
            iconPath="/glo-logo.svg"
            title="Copy the Glo smart contract address"
            content={sliceAddress(getSmartContractAddress(chain!.id), 8)}
            action={() => {
              navigator.clipboard.writeText(getSmartContractAddress(chain!.id));
              setIsCopiedTooltipOpen(true);
              setIsCopiedStepDone(true);
            }}
            done={isCopiedStepDone}
          />
        </div>
        <StepCard
          index={5}
          iconPath="/zeroswap.svg"
          title="Swap with Glo on Zeroswap"
          content="Select the output currency and paste the Glo contract address"
          action={() => {
            chain && buyWithSwap(buyAmount, chain, "Zeroswap");
            setIsSwapStepDone(true);
          }}
          done={isSwapStepDone}
        />
      </section>
    </div>
  );
}
