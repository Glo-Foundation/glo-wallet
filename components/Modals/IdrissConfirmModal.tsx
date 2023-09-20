import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { api, sliceAddress } from "@/lib/utils";

export default function IdrissConfirmModal() {
  const { address } = useAccount();
  const { closeModal } = useContext(ModalContext);
  const { setCTAs } = useUserStore();

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const [id, setId] = useState("");
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
          Enter the IDriss email / twitter / phone number that you used during
          IDriss registration.
        </p>
      </section>
      <section>
        <input
          id="sign-in-with-email"
          className="rounded-full bg-white py-4 pl-6 pr-28 text-xl"
          placeholder={"Email / Twitter / Phone"}
          value={id}
          data-testid="submit-email-input"
          onChange={(e) => setId(e.target.value)}
        />
      </section>
      <section className="mt-8 flex flex-col justify-end">
        <button
          className="primary-button"
          onClick={async () => {
            await api().get(`/idriss/confirm/${id}`);
            api()
              .get<CTA[]>(`/ctas`)
              .then((res) => {
                setCTAs(res.data);
                closeModal();
              });
          }}
        >
          Submit
        </button>
      </section>
    </div>
  );
}
