import clsx from "clsx";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount } from "wagmi";

import BuyGloModal from "@/components/Modals/BuyGloModal";
import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { buyWithTransak, buyWithUniswap } from "@/payments";

import BuyingGuideModal from "./BuyingGuideModal";

export default function PaymentOptionModal({
  buyAmount,
}: {
  buyAmount: number;
}) {
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

    const script = document.createElement("script");
    script.type = "module";
    script.async = true;
    script.src = "https://scripts.embr.org/checkout/checkout.js";
    document.head.append(script);

    const a = document.getElementById("Embr");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a as any).dataset.mattr = "";
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
      <div className="text-pine-700">{label}</div>
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
      id={name}
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
        <Double className="min-w-[18%]" label="Fees" value={`${fees}%`} />
        <Double className="min-w-[36%]" label="Works for" value={worksFor} />
        <Double className="min-w-[40%]" label="Delay" value={delay} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-2">
      <div className="flex flex-row justify-between p-3">
        <Image
          src="/arrow-right.svg"
          width={25}
          height={25}
          alt="arrow-right"
          className="flex w-25px max-w-25px h-25px max-h-25px scale-x-[-1] cursor-pointer -translate-x-1"
          onClick={() => openModal(<BuyGloModal />)}
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
      <h2 className="text-center">Choose a path to start buying Glo Dollars</h2>
      <BuyBox
        name="Uniswap"
        icon="/uniswap.svg"
        fees=".01"
        worksFor="🔐 Crypto"
        delay="⚡ Instant"
        onClick={() => buyWithUniswap(buyAmount)}
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
                    buyWithProvider={() => buyWithTransak(buyAmount, address!)}
                    buyAmount={buyAmount}
                  />
                )
              }
            />
          )}
          <BuyBox
            name="Coinbase + Uniswap"
            icon="/coinbase.png"
            fees=".01-5"
            worksFor="💳 Fiat"
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
                  buyAmount={buyAmount}
                />
              );
            }}
          />
          <BuyBox
            name="Embr"
            icon="/embr.png"
            fees="1-3"
            worksFor="💳 Cards"
            delay="⚡ Instant"
            onClick={() => {
              const findElByText = (text: string) =>
                document.evaluate(
                  `//div[contains(text(), "${text}")]`,
                  document,
                  null,
                  XPathResult.ANY_TYPE, // or ORDERED_NODE_SNAPSHOT_TYPE
                  null
                );

              const tryAttachingEvent = () => {
                const copyButton = findElByText("Copy to Clipboard");

                if (copyButton && copyButton.snapshotLength > 0) {
                  closeModal();
                  copyButton
                    .iterateNext()
                    ?.parentNode?.parentNode?.addEventListener("click", () =>
                      console.log(123)
                    );
                } else {
                  setTimeout(() => {
                    // If modal closed stop trying
                    if (
                      document.getElementById("__CONNECTKIT__")?.children.length
                    ) {
                      tryAttachingEvent();
                    }
                  }, 1000);
                }
              };

              tryAttachingEvent();
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
