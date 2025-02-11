import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import SquidModal from "./SquidModal";

export default function SellGloModal() {
  const { address, isConnected } = useAccount();

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  const { openModal, closeModal } = useContext(ModalContext);

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  return (
    <div className="flex flex-col min-w-[343px] text-pine-900 p-2">
      <div className="flex flex-row justify-between p-3">
        <Image
          src="/arrow-right.svg"
          width={25}
          height={25}
          alt="arrow-right"
          className="flex w-25px max-w-25px h-25px max-h-25px scale-x-[-1] cursor-pointer -translate-x-1"
          onClick={() => closeModal()}
        />
        <Tooltip id="copy-deposit-tooltip" isOpen={isCopiedTooltipOpen} />
        {isConnected && (
          <button
            className="copy cursor-pointer border-2 rounded-full border-cyan-200 px-3 py-1"
            data-tooltip-id="copy-deposit-tooltip"
            data-tooltip-content="Copied!"
            onClick={() => {
              navigator.clipboard.writeText(address!);
              setIsCopiedTooltipOpen(true);
            }}
          >
            🔗 {sliceAddress(address!)}
          </button>
        )}
        <button onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <h2 className="text-center pt-0">Sell Glo Dollars</h2>
      <div className="flex flex-col space-y-2 mt-4">
        <button
          className="bg-cyan-600 text-pine-900 h-[52px] py-3.5 mx-6"
          onClick={() => openModal(<SquidModal buyAmount={1000} />)}
        >
          Swap from USDGLO to USDC (Powered by Squid Router)
        </button>
        <button
          className="bg-cyan-600 text-pine-900 h-[52px] py-3.5 mx-6"
          onClick={() => window.open("https://peanut.to/cashout", "_blank")}
        >
          Withdraw to bank account in EU or USA (Powered by Peanut Protocol)
        </button>
        <button
          className="bg-cyan-600 text-pine-900 h-[52px] py-3.5 mx-6"
          onClick={() => window.open("https://www.offramp.xyz/", "_blank")}
        >
          Pay with debit card in 160+ countries (Powered by Offramp.xyz)
        </button>
      </div>
    </div>
  );
}
