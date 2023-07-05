import Image from "next/image";
import { useContext, useRef } from "react";
import { useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";

export default function PaymentOptionModal() {
  const { isConnected } = useAccount();

  const ref = useRef<HTMLDivElement>(null);

  const { closeModal } = useContext(ModalContext);

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900" ref={ref}>
      <div className="flex flex-row justify-between">
        <div></div>
        <button className="" onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      {isConnected && (
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
      )}
    </div>
  );
}
