import Image from "next/image";
import { useContext, useState, useEffect } from "react";
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

  const chainId = chain?.id.toString();

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const config = {
    integratorId: process.env.NEXT_PUBLIC_SQUID_INTEGRATION_ID,
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
  };

  const src = `https://studio.squidrouter.com/iframe?config=${JSON.stringify(
    config
  )}`;

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
        <iframe
          title="squid_widget"
          width="430"
          height="684"
          src={src}
        ></iframe>
      </section>
    </div>
  );
}
