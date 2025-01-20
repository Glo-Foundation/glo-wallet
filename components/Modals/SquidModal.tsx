import { SquidWidget } from "@0xsquid/widget";
import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { celo } from "viem/chains";
import { useAccount } from "wagmi";

import { getSmartContractAddress } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { getUSDCContractAddress } from "@/utils";
interface Props {
  buyAmount: number;
}

export default function SquidModal({}: Props) {
  const { closeModal } = useContext(ModalContext);
  const { chain } = useAccount();

  const chainId = chain?.id.toString() || celo.id.toString();

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  return (
    <div className="flex flex-col text-pine-900 p-2">
      <div className="flex flex-row justify-between p-3">
        <Image
          src="/arrow-right.svg"
          width={25}
          height={25}
          alt="arrow-right"
          className="flex w-25px max-w-25px h-25px max-h-25px scale-x-[-1] cursor-pointer -translate-x-1"
          onClick={() => closeModal()}
        />

        <button onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <section>
        <SquidWidget
          config={{
            integratorId: process.env.NEXT_PUBLIC_SQUID_INTEGRATION_ID!,
            apiUrl: "https://apiplus.squidrouter.com",
            initialAssets: {
              from: {
                chainId,
                address: getUSDCContractAddress(chain!).toLowerCase(),
              },
              to: {
                chainId,
                address: getSmartContractAddress(chain?.id).toLowerCase(),
              },
            },
          }}
        />
      </section>
      <div className="flex justify-center items-center mt-4">
        <div className="loader"></div>
      </div>
      <div className="flex flex-col space-y-2 mt-4">
        <button
          className="bg-cyan-600 text-pine-900 h-[52px] py-3.5 mx-6"
          onClick={() => window.open("https://peanut.to/cashout", "_blank")}
        >
          Sell for wire to US/CAD/EU bank accounts
        </button>
        <button
          className="bg-cyan-600 text-pine-900 h-[52px] py-3.5 mx-6"
          onClick={() => window.open("https://www.offramp.xyz/", "_blank")}
        >
          Sell for card in 160+ countries
        </button>
      </div>
    </div>
  );
}
STATUS: P32aa STEP-MADE
STATUS: P26aa STEP-MADE
STATUS: Pd91f STEP-MADE
components/Modals/SquidModal.tsx
