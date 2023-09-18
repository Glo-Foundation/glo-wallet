import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount } from "wagmi";

import StepCard from "@/components/Modals/StepCard";
import { ModalContext } from "@/lib/context";
import { isIdriss } from "@/lib/idriss";
import { useUserStore } from "@/lib/store";
import { api, sliceAddress } from "@/lib/utils";

interface Props {
  balance: number;
}

export default function IdrissModal({ balance }: Props) {
  const { address } = useAccount();
  const { closeModal } = useContext(ModalContext);
  const { setCTAs } = useUserStore();

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const [isRegisteredWithIdriss, setIsRegisteredWithIdriss] = useState(false);

  const onClose = () => {
    closeModal();
    api()
      .get<CTA[]>(`/ctas`)
      .then((res) => {
        setCTAs(res.data);
      });
  };

  useEffect(() => {
    const init = async () => {
      await api().get("/idriss");

      const isRegistered = await isIdriss(address!);
      if (isRegistered) {
        setIsRegisteredWithIdriss(true);
      }
    };
    init();
  }, [address]);

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-2">
      <div className="flex flex-row justify-between p-3">
        <Image
          src="/arrow-right.svg"
          width={25}
          height={25}
          alt="arrow-right"
          className="flex w-25px max-w-25px h-25px max-h-25px scale-x-[-1] cursor-pointer -translate-x-1"
          onClick={() => onClose()}
        />
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
        <button onClick={() => onClose()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <section className="text-center">
        <h3 className="pt-0">Register IDriss</h3>
        <p className="text-sm py-6">Blabla.</p>
      </section>
      <section>
        <StepCard
          index={1}
          iconPath="/glo-logo.svg"
          title={"Hold 100GLO"}
          content="100GLO across all chains"
          done={balance >= 100}
        />
        <StepCard
          index={2}
          iconPath="/coinbase-invert.svg"
          title={`Register with IDriss`}
          content="Connect your wallet to IDriss"
          action={() => {
            isIdriss(address!).then((isRegistered) => {
              if (isRegistered) {
                setIsRegisteredWithIdriss(true);
              } else {
                window.open("https://www.idriss.xyz/", "_blank");
              }
            });
          }}
          done={isRegisteredWithIdriss}
        />
      </section>
    </div>
  );
}
