import Image from "next/image";
import { useContext, useEffect } from "react";
import { useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { buyWithCoinbase, buyWithTransak, buyWithUniswap } from "@/payments";

export default function PaymentOptionModal() {
  const { address, isConnected } = useAccount();

  const { closeModal } = useContext(ModalContext);

  useEffect(() => {
    const bc = new BroadcastChannel("glo-channel-purchased");
    bc.onmessage = () => {
      console.log("Popup closed - reloading...");
      // Refetch balance, ctas etc.
    };
  }, []);

  const Double = ({ label, value }: { label: string; value: string }) => (
    <div className="mr-3">
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
  }: {
    name: string;
    icon: string;
    fees: string;
    worksFor: string;
    delay: string;
    onClick: () => void;
  }) => (
    <div
      className="flex flex-col p-3 border-2 rounded-xl border-pine-100 hover:border-pine-800 cursor-pointer mb-2"
      onClick={onClick}
    >
      <div className="flex py-2">
        <Image alt={name} src={icon} height={25} width={25} />

        <h3 className="px-3">{name}</h3>
      </div>
      <div className="flex">
        <Double label="Fees" value={`${fees}%`} />
        <Double label="Works for" value={worksFor} />
        <Double label="Delay" value={delay} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-2">
      <div className="flex flex-row justify-between p-3">
        <div></div>
        <div className="border-2 rounded-full border-cyan-400 px-3">
          🔗 {sliceAddress(address!)}
        </div>
        <button onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <h2 className="text-center">Choose a payment option to buy Glo Dollar</h2>
      {isConnected && address && (
        <>
          <BuyBox
            name="Ratio"
            icon="/ratio.png"
            fees="0"
            worksFor="🇺🇸 US citizens"
            delay="Up to 3 days"
            onClick={() => {
              const parent = document.getElementById("ratio-button-parent");
              const button = parent?.firstChild as HTMLButtonElement;
              if (button) {
                // closeModal();
                button.click();
              }
            }}
          />
          <BuyBox
            name="Transak"
            icon="/transak.png"
            fees="0"
            worksFor="🇺🇸 US citizens"
            delay="Up to 3 days"
            onClick={() => buyWithTransak(1000, address)}
          />{" "}
          <BuyBox
            name="Uniswap"
            icon="/uniswap.png"
            fees=".01"
            worksFor="🔐 Crypto"
            delay="⚡ Instant"
            onClick={() => buyWithUniswap(1000)}
          />{" "}
          <BuyBox
            name="Coinbase"
            icon="/coinbase.png"
            fees="0-3"
            worksFor="🌍 world"
            delay="⚡ Instant"
            onClick={() => buyWithCoinbase()}
          />
        </>
      )}
      <button className="bg-pine-300 h-[52px] py-3.5 mx-6">
        Help me choose
      </button>
    </div>
  );
}
