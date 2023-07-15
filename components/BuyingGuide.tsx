import { polygon } from "@wagmi/chains";
import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { getUSFormattedNumber } from "@/utils";

type Props = {
  glo: number;
};

export default function BuyingGuide({ glo }: Props) {
  const { address } = useAccount();
  const { closeModal } = useContext(ModalContext);
  const formattedGlo = getUSFormattedNumber(glo);
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const userIsOnPolygon = chain?.id === polygon.id;

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-4">
      <div className="flex flex-row justify-between p-3">
        <div></div>
        <Tooltip id="copy-deposit-tooltip" isOpen={isCopiedTooltipOpen} />
        <button
          className="copy cursor-pointer border-2 rounded-full border-cyan-200 px-3"
          data-tooltip-id="copy-deposit-tooltip"
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
      </div>
      <h2 className="flex justify-center p-0">Buying Glo Dollars</h2>
      <h4 className="flex justify-center">through Coinbase and Uniswap</h4>
      <p>
        You can get Glo Dollars by exchanging another stablecoin co-created by
        Coinbase called USDC for Glo Dollar using the Uniswap app.
      </p>
    </div>
  );
}
