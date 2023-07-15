import { polygon } from "@wagmi/chains";
import clsx from "clsx";
import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { getUSFormattedNumber } from "@/utils";

export default function BuyingGuide() {
  const { address } = useAccount();
  const { closeModal } = useContext(ModalContext);
  // const formattedGlo = getUSFormattedNumber(glo);
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const userIsOnPolygon = chain?.id === polygon.id;

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const StepCard = ({
    index,
    iconPath,
    title,
    content,
    balance,
    done = false,
  }: {
    index: number;
    iconPath: string;
    title: string;
    content: string;
    balance?: string;
    done?: boolean;
  }) => (
    <div
      className={clsx(
        "flex items-center p-3 border-2 rounded-xl border-pine-100 hover:border-pine-800 mb-2",
        done && "bg-cyan-600/20"
      )}
    >
      <div
        className={clsx(
          "relative circle border-2 w-[32px] h-[32px]",
          done && "border-none bg-cyan-600"
        )}
      >
        {!done ? (
          index
        ) : (
          <Image alt="checkmark" src="check-alpha.svg" height={12} width={12} />
        )}
        <div className="circle border-2 w-[24px] h-[24px] absolute top-[-10px] right-[-12px]">
          <Image alt={iconPath} src={iconPath} height={20} width={20} />
        </div>
      </div>
      <div className="pl-4">
        <h5 className="text-sm mb-2">{title}</h5>
        <p className="copy text-xs">
          {content}{" "}
          {index === 3 && (
            <>
              <Image
                alt="qrcode"
                style={{ display: "inline" }}
                src="/miniqr.svg"
                height={16}
                width={16}
              />{" "}
              +&nbsp;
              <Image
                alt="copypaste"
                style={{ display: "inline" }}
                src="/copy.svg"
                height={16}
                width={16}
              />
            </>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-2">
      <div className="flex flex-row justify-between p-3">
        <div></div>
        <Tooltip id="copy-deposit-tooltip" isOpen={isCopiedTooltipOpen} />
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
        <button onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <section className="text-center">
        <h3 className="pt-0">
          Buying Glo Dollars through Coinbase and Uniswap
        </h3>
        <p className="text-sm py-6">
          You can get Glo Dollars by exchanging another stablecoin co-created by
          Coinbase called <b>USDC</b> for Glo Dollar using the <b>Uniswap</b>{" "}
          app.
        </p>
      </section>
      <section>
        <StepCard
          index={1}
          iconPath="/coinbase-invert.svg"
          title={`Buy ${1000} USDC on Coinbase`}
          content="Withdraw to the wallet address shown above"
          done={false}
        />
        <StepCard
          index={2}
          iconPath="/polygon.svg"
          title={"Switch to the Polygon network"}
          content="Please confirm the switch in your wallet"
          done={false}
        />
        <StepCard
          index={3}
          iconPath="/uniswap.svg"
          title={"Connect wallet on Uniswap"}
          content={`Choose WalletConnect and click `}
          done={false}
        />
        <StepCard
          index={4}
          iconPath="/sequence.svg"
          title={"Switch to the Polygon network"}
          content="Please confirm the switch in your wallet"
          done={false}
        />
      </section>
    </div>
  );
}
