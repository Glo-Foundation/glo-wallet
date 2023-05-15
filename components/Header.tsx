import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useContext } from "react";
import { useConnect, useDisconnect } from "wagmi";

import { ModalContext } from "@/lib/context";

type Props = {
  address?: string;
  isConnected: boolean;
};
export default function Header({ address, isConnected }: Props) {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();
  const { openModal, closeModal } = useContext(ModalContext);

  const receive = async () => {
    openModal(
      <div className="flex flex-col items-center">
        <QRCodeSVG size={128} value={address as string} />
        <span className="pt-8 text-l max-w-[50%] flex flex-wrap">
          Wallet Address:
        </span>
        <div>{address}</div>
      </div>
    );
  };

  return (
    <nav className="mb-9 mt-6 flex justify-between items-center">
      <a href="https://glodollar.org/">
        <Image src="/glo-logo-text.svg" alt="glo logo" width={74} height={26} />
      </a>
      {isConnected ? (
        <>
          <span className="cursor-pointer" onClick={() => receive()}>
            {address?.slice(0, 5)}...
            {address?.slice(-3)}
          </span>
          <button className="primary-button" onClick={() => disconnect()}>
            Disconnect
          </button>
        </>
      ) : (
        <button
          className="primary-button"
          onClick={() => connect({ connector: connectors[0] })}
        >
          Connect
        </button>
      )}
    </nav>
  );
}
