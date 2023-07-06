import Image from "next/image";
import { useContext, useEffect, useRef } from "react";
import { useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";
import { buyWithTransak } from "@/payments";

export default function PaymentOptionModal() {
  const { address, isConnected } = useAccount();

  const ref = useRef<HTMLDivElement>(null);

  const { closeModal } = useContext(ModalContext);

  useEffect(() => {
    const bc = new BroadcastChannel("glo-channel-purchased");
    bc.onmessage = () => {
      console.log("Popup closed - reloading...");
      // Refetch balance, ctas etc.
    };
  }, []);

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900" ref={ref}>
      <div className="flex flex-row justify-between">
        <div></div>
        <button className="" onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      {isConnected && address && (
        <>
          <button
            onClick={() => {
              const parent = document.getElementById("ratio-button-parent");
              const button = parent?.firstChild as HTMLButtonElement;
              if (button) {
                closeModal();
                button.click();
              }
            }}
          >
            Buy with Ratio
          </button>
          <button onClick={() => buyWithTransak(address)}>
            Buy with Transak
          </button>
        </>
      )}
    </div>
  );
}
