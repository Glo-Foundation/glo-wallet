import { sequence } from "0xsequence";
import clsx from "clsx";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount, useNetwork } from "wagmi";

import BuyGloModal from "@/components/Modals/BuyGloModal";
import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { buyWithSwap } from "@/payments";

import BuyWithCoinbaseSequenceModal from "./BuyWithCoinbaseSequenceModal";
import BuyWithZeroswapModal from "./BuyWithZeroswapModal";

export default function PaymentOptionModal({
  buyAmount,
}: {
  buyAmount: number;
}) {
  const { address, connector, isConnected } = useAccount();
  const { chain } = useNetwork();

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  const { openModal, closeModal } = useContext(ModalContext);

  const isSequenceWallet = connector?.id === "sequence";
  const isMetamaskWallet = connector?.id === "metaMask";

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

    // Attach Embr script to button
    const a = document.getElementById("Unlimit + Embr");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (a) {
      (a as any).dataset.mattr = "";
    }
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

  const openEmbrModal = () => {
    const findElByText = (text: string, el = "div") =>
      document
        .evaluate(
          `//${el}[contains(text(), "${text}")]`,
          document,
          null,
          XPathResult.ANY_TYPE,
          null
        )
        .iterateNext();

    const tryAttachingEvent = () => {
      const copyButton = findElByText("Copy to Clipboard");
      if (copyButton) {
        copyButton?.parentNode?.parentNode?.parentNode?.addEventListener(
          "click",
          () => {
            setTimeout(() => {
              const wallet = sequence.getWallet();
              wallet.openWallet("/wallet/scan");
            }, 1000);
          }
        );
      } else {
        const el = Array.from(document?.body.getElementsByTagName("div")).find(
          (x) => x.shadowRoot
        );
        // If modal closed stop trying
        if (el?.shadowRoot?.children.length || 0 > 1) {
          setTimeout(() => {
            tryAttachingEvent();
          }, 1000);
        }
      }
    };

    tryAttachingEvent();
    closeModal();
  };

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-2">
      <div className="flex flex-row justify-between p-3">
        <Image
          src="/arrow-right.svg"
          width={25}
          height={25}
          alt="arrow-right"
          className="flex w-25px max-w-25px h-25px max-h-25px scale-x-[-1] cursor-pointer -translate-x-1"
          onClick={() => openModal(<BuyGloModal totalBalance={buyAmount} />)}
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
      <h2 className="text-center pt-0">
        Choose a path to start buying Glo Dollars
      </h2>

      {isConnected && address && (
        <BuyBox
          name="Sequence (+ Coinbase)"
          icon="/sequence.svg"
          fees=".01-5"
          worksFor="💳 Fiat"
          delay="⚡ 0-3 Days"
          onClick={() => {
            openModal(<BuyWithCoinbaseSequenceModal buyAmount={buyAmount} />);
          }}
        />
      )}
      {isSequenceWallet && (
        <BuyBox
          name="Zeroswap [gasless]"
          icon="/zeroswap.svg"
          fees=".01"
          worksFor="🔐 Crypto"
          delay="⚡ Instant"
          onClick={() => {
            openModal(<BuyWithZeroswapModal buyAmount={buyAmount} />);
          }}
        />
      )}
      <BuyBox
        name="Uniswap"
        icon="/uniswap.svg"
        fees=".01"
        worksFor="🔐 Crypto"
        delay="⚡ Instant"
        onClick={() => chain && buyWithSwap(buyAmount, chain, "Uniswap")}
      />
      {isMetamaskWallet && (
        <BuyBox
          name="Matcha [gasless]"
          icon="/matcha.svg"
          fees=".01"
          worksFor="🔐 Crypto"
          delay="⚡ Instant"
          onClick={() => chain && buyWithSwap(buyAmount, chain, "Matcha")}
        />
      )}

      {isConnected && address && (
        <BuyBox
          name="Unlimit + Embr"
          icon="/unlimit.png"
          fees="1-3"
          worksFor="💳 Cards"
          delay="⚡ Instant"
          onClick={openEmbrModal}
        />
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
