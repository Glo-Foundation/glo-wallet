import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect, useContext } from "react";
import { Tooltip } from "react-tooltip";
import { useDisconnect } from "wagmi";

import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";

type Props = {
  address?: string;
};
export default function UserInfoModal({ address }: Props) {
  const { disconnect } = useDisconnect();
  const { closeModal } = useContext(ModalContext);
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const { setTransfers, setCTAs } = useUserStore();

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const handleLogout = () => {
    disconnect();
    setTransfers([]);
    setCTAs([]);
    localStorage.setItem("showedLogin", "true");
    closeModal();
  };

  return (
    <div className="p-8">
      <div className="flex flex-row justify-between">
        <div></div>
        <button className="" onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <section className="flex items-center">
        <div className="p-4 border-2">
          <QRCodeSVG size={128} value={address!} />
        </div>
        <div className="ml-6">
          <h3 className="text-l max-w-[50%] flex flex-wrap">wallet address:</h3>
          <div className="copy pseudo-input-text">
            <span>{address}</span>
            <Tooltip
              anchorId="copy-deposit-address"
              content="Copied!"
              noArrow={true}
              isOpen={isCopiedTooltipOpen}
            />
            <button
              id="copy-deposit-address"
              className="pl-2"
              onClick={() => {
                navigator.clipboard.writeText(address!);
                setIsCopiedTooltipOpen(true);
              }}
            >
              <Image src={`/copy.svg`} height={15} width={15} alt="" />
            </button>
          </div>
        </div>
      </section>
      <section className="my-4 flex justify-end">
        <button className="primary-button" onClick={() => handleLogout()}>
          Log out
        </button>
      </section>
    </div>
  );
}
