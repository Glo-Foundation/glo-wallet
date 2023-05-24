import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useState, useContext } from "react";
import { useDisconnect } from "wagmi";

import { ModalContext } from "@/lib/context";

type Props = {
  address: string;
};
export default function UserInfoModal({ address }: Props) {
  const { disconnect } = useDisconnect();
  const { closeModal } = useContext(ModalContext);
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const handleLogout = () => {
    disconnect();
    closeModal();
  };

  return (
    <div className="px-4">
      <section className="flex items-center">
        <div className="p-4 border-2">
          <QRCodeSVG size={128} value={address!} />
        </div>
        <div className="ml-6">
          <h3 className="text-l max-w-[50%] flex flex-wrap">wallet address:</h3>
          <div className="copy pseudo-input-text">
            <span>{address}</span>
            <button
              id="copy-deposit-address"
              className="pl-2"
              onClick={() => navigator.clipboard.writeText(address)}
            >
              <Image src={`/copy.svg`} height={15} width={15} alt="" />
            </button>
          </div>
        </div>
      </section>
      <section className="mt-4 flex justify-end">
        <button className="primary-button" onClick={() => handleLogout()}>
          Log out
        </button>
      </section>
    </div>
  );
}
