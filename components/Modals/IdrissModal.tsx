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
        <h3 className="pt-0">IDriss 🤝 Glo Dollar</h3>
        <p className="text-sm py-4">
          We&apos;ve teamed up to gift a free IDriss registration to people who
          own $100+ Glo Dollar.
        </p>
        <p className="text-sm pb-4">
          With an IDriss you can use an 📧, 📱 or @twitter instead of your
          wallet address, and share your impact with an easier link:
          /@geyr_garmr
        </p>
      </section>
      <section>
        <StepCard
          index={1}
          iconPath="/glo-logo.svg"
          title="Buy $100 Glo Dollars (or more!)"
          content="Across all blockchains"
          done={balance >= 100}
        />
        <StepCard
          index={2}
          iconPath="/coinbase-invert.svg"
          title="Request a free IDriss registration"
          content="Just click here"
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
        <StepCard
          index={3}
          iconPath="/idriss.png"
          title="Complete IDriss registration"
          content="Connect your wallet on idriss.xyz"
          done={isRegisteredWithIdriss}
        />
      </section>
    </div>
  );
}
