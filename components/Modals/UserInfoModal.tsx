import { polygon, polygonMumbai } from "@wagmi/core/chains";
import Cookies from "js-cookie";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect, useContext } from "react";
import { Tooltip } from "react-tooltip";
import { useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";

import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { isProd, sliceAddress } from "@/lib/utils";

type Props = {
  address?: string;
};
export default function UserInfoModal({ address }: Props) {
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { closeModal } = useContext(ModalContext);
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const { setTransfers, setCTAs } = useUserStore();
  const { switchNetwork } = useSwitchNetwork();

  const expectedChain = isProd() ? polygon : polygonMumbai;

  const email = Cookies.get("glo-email");

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const handleLogout = () => {
    disconnect();
    setTransfers({ transfers: [] });
    setCTAs([]);
    localStorage.setItem("showedLogin", "true");
    closeModal();
  };

  return (
    <div className="py-6 px-10">
      <div className="flex flex-row justify-between">
        <div></div>
        <button className="" onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <section className="flex flex-col items-center">
        <div className="my-4 p-4 border-2">
          <QRCodeSVG size={169} value={address!} />
        </div>
        <div>
          <h5>Network:</h5>
          <div className="copy pseudo-input-text text-sm">
            <span>
              {chain?.name} ({chain?.id})
            </span>
          </div>

          <h5 className="mt-6">Wallet Address:</h5>
          <div className="copy pseudo-input-text text-sm">
            <span>{sliceAddress(address!, 9)}</span>
            <Tooltip id="copy-deposit-tooltip" isOpen={isCopiedTooltipOpen} />
            <button
              data-tooltip-id="copy-deposit-tooltip"
              data-tooltip-content="Copied!"
              className="pl-2"
              onClick={() => {
                navigator.clipboard.writeText(address!);
                setIsCopiedTooltipOpen(true);
              }}
            >
              <Image src={`/copy.svg`} height={15} width={15} alt="" />
            </button>
          </div>

          {email && (
            <>
              <h5 className="mt-6">Email:</h5>
              <div className="copy pseudo-input-text text-sm">
                <span>{email}</span>
              </div>
            </>
          )}
        </div>
      </section>
      <section className="mt-8 flex flex-col space-y-2 justify-end">
        {chain?.id !== expectedChain.id && (
          <button
            className="primary-button"
            onClick={() => switchNetwork!(expectedChain.id)}
          >
            Switch to Polygon
          </button>
        )}
        <button className="primary-button" onClick={() => handleLogout()}>
          Log out
        </button>
      </section>
    </div>
  );
}
