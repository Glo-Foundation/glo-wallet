import clsx from "clsx";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { buyWithTransak, buyWithUniswap } from "@/payments";

import BuyingGuideModal from "./BuyingGuideModal";

export default function PaymentOptionModal() {
  const { address, isConnected } = useAccount();

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  const { openModal, closeModal } = useContext(ModalContext);

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  useEffect(() => {
    const bc = new BroadcastChannel("glo-channel-purchased");
    bc.onmessage = () => {
      console.log("Popup closed - reloading...");
      // Refetch balance, ctas etc.
    };
  }, []);

  const Double = ({
    label,
    value,
    className,
  }: {
    label: string;
    value: string;
    className: string;
  }) => (
    <div className={clsx("mr-5", className)}>
      <div className="text-pine-700 font-bold">{label}</div>
      <div className="text-black font-bold"> {value}</div>
    </div>
  );

  const BuyBox = ({
    name,
    icon,
    fees,
    worksFor,
    delay,
    onClick,
    disabled = false,
  }: {
    name: string;
    icon: string;
    fees: string;
    worksFor: string;
    delay: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <div
      className={clsx(
        "flex flex-col p-3 border-2 rounded-xl border-pine-100 hover:border-pine-800 cursor-pointer mb-2",
        disabled && "bg-pine-100 hover:border-pine-100"
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex py-2">
        <Image alt={name} src={icon} height={28} width={28} />

        <h3 className="px-3">{name}</h3>
      </div>
      <div className="flex">
        <Double className="min-w-[15%]" label="Fees" value={`${fees}%`} />
        <Double className="min-w-[38%]" label="Works for" value={worksFor} />
        <Double className="min-w-[40%]" label="Delay" value={delay} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-2">
      <div className="flex flex-row justify-between p-3">
        <div></div>
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
      <h2 className="text-center">Choose a payment option to buy Glo Dollar</h2>
      <BuyBox
        name="Uniswap"
        icon="/uniswap.svg"
        fees=".01"
        worksFor="🔐 Crypto"
        delay="⚡ Instant"
        onClick={() => buyWithUniswap(1000)}
      />
      {isConnected && address && (
        <>
          {false && (
            <BuyBox
              name="Transak"
              icon="/transak.png"
              fees="1-5"
              worksFor="🌍 world"
              delay="⚡ Instant"
              onClick={() =>
                openModal(
                  <BuyingGuideModal
                    iconPath="/transak.png"
                    provider="Transak"
                    buyWithProvider={() => buyWithTransak(1000, address!)}
                  />
                )
              }
            />
          )}
          <BuyBox
            name="Coinbase"
            icon="/coinbase.png"
            fees="0-3"
            worksFor="🌍 world"
            delay="⚡ Instant"
            onClick={() => {
              openModal(
                <BuyingGuideModal
                  iconPath="/coinbase-invert.svg"
                  provider="Coinbase"
                  buyWithProvider={() =>
                    window.open(
                      "https://www.coinbase.com/how-to-buy/usdc",
                      "_blank"
                    )
                  }
                />
              );
            }}
          />
        </>
      )}
      {
        // Temporary disabled
        false && isConnected && (
          <button className="bg-pine-300 h-[52px] py-3.5 mx-6">
            Help me choose
          </button>
        )
      }
    </div>
  );
}
