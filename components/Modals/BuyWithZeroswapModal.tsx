import Image from "next/image";
import { useState, useEffect, useContext } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount, useNetwork } from "wagmi";

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
  const { address } = useAccount();
  const { openModal, closeModal } = useContext(ModalContext);

  const { chain } = useNetwork();
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const [isCopiedStepDone, setIsCopiedStepDone] = useState(false);
  const [isSwapStepDone, setIsSwapStepDone] = useState(false);

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
        <div data-tooltip-id="copy-tooltip" data-tooltip-content="Copied!">
          <StepCard
            index={1}
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
          index={2}
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
