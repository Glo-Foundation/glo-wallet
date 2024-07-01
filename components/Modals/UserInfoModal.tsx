import Cookies from "js-cookie";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect, useContext } from "react";
import { Tooltip } from "react-tooltip";
import { useDisconnect, useNetwork } from "wagmi";

import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { sliceAddress } from "@/lib/utils";

type Props = {
  address?: string;
  idrissName?: string;
  stellarConnected: boolean;
  setStellarConnected: (bool: boolean) => void;
  setStellarAddress: (str: string) => void;
};

export default function UserInfoModal({
  address,
  idrissName,
  stellarConnected,
  setStellarConnected,
  setStellarAddress,
}: Props) {
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { closeModal } = useContext(ModalContext);
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const { setTransfers, setCTAs, setRecipientsView } = useUserStore();

  const email = Cookies.get("glo-email");

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const handleLogout = () => {
    if (stellarConnected) {
      disconnectStellar();
    } else {
      disconnect();
    }
    setTransfers({ transfers: [] });
    setCTAs([]);
    localStorage.setItem("showedLogin", "true");
    setRecipientsView(false);

    closeModal();
  };

  async function disconnectStellar() {
    localStorage.setItem("stellarAddress", "");
    localStorage.setItem("stellarConnected", "false");
    localStorage.setItem("stellarWalletId", "");
    setStellarAddress("");
    setStellarConnected(false);
  }

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
          <QRCodeSVG size={169} value={address!} data-testid="profile-qr" />
        </div>
        <div>
          <h5>Network:</h5>
          <div className="copy pseudo-input-text text-sm">
            <span data-testid="profile-network">
              {stellarConnected && <div>Stellar</div>}
              {!stellarConnected && (
                <div>
                  {chain?.name} ({chain?.id})
                </div>
              )}
            </span>
          </div>

          <h5 className="mt-6">Wallet Address:</h5>
          <div className="copy pseudo-input-text text-sm">
            <span data-testid="profile-address">
              {sliceAddress(address!, 9)}
            </span>
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
                <span data-testid="profile-email">{email}</span>
              </div>
            </>
          )}
          {idrissName && (
            <>
              <h5 className="mt-6">IDriss ID:</h5>
              <div className="copy pseudo-input-text text-sm">
                <span data-testid="profile-idriss">{idrissName}</span>
              </div>
            </>
          )}
        </div>
      </section>
      <section className="mt-8 flex flex-col justify-end">
        <button
          className="primary-button"
          onClick={() => handleLogout()}
          data-testid="profile-logout"
        >
          Log out
        </button>
      </section>
    </div>
  );
}
