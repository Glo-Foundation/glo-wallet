import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount } from "wagmi";

import StepCard from "@/components/Modals/StepCard";
import { ModalContext } from "@/lib/context";
import { api, sliceAddress } from "@/lib/utils";

import IdrissConfirmModal from "./IdrissConfirmModal";

interface Props {
  balance: number;
}

export default function IdrissModal({ balance }: Props) {
  const { address } = useAccount();
  const { openModal, closeModal } = useContext(ModalContext);

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const [startedRegistration, setstartedRegistration] = useState(false);
  const [requestedRegistration, setRequestedRegistration] = useState(false);

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
          onClick={() => closeModal()}
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
        <button onClick={() => closeModal()}>
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
          wallet address, and share your impact with an easier link:&nbsp;
          <a className="black-link" target="_blank" href="/impact/@geyr_garmr">
            /impact/@geyr_garmr
          </a>
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
          iconPath="/idriss.png"
          title="Request a free IDriss registration"
          content="Just click here"
          action={async () => {
            setRequestedRegistration(true);
            await api().get("/idriss");
          }}
          done={requestedRegistration}
        />
        <StepCard
          index={3}
          iconPath="/idriss.png"
          title="Complete IDriss registration"
          content="Connect your wallet on idriss.xyz"
          action={() => {
            window.open("https://www.idriss.xyz/", "_blank");
            setstartedRegistration(true);
          }}
          done={startedRegistration}
        />
        <StepCard
          index={4}
          iconPath="/idriss.png"
          title="Confirm IDriss identity"
          content="Enter your IDriss email/twitter/phone"
          action={() => openModal(<IdrissConfirmModal />)}
        />
      </section>
    </div>
  );
}
