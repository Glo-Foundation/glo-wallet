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
      <div>
        <QRCodeSVG value={address as string} />
        {address}
      </div>
    );
  };

  return (
    <nav className="mb-9 mt-6 flex justify-between">
      <a href="https://glodollar.org/">
        <Image src="/glo-logo-text.svg" alt="glo logo" width={74} height={26} />
      </a>
      {isConnected ? (
        <>
          <button onClick={() => receive()}>
            {address?.slice(0, 5)}...
            {address?.slice(-3)}
          </button>
          <button onClick={() => disconnect()}>[Disconnect]</button>
        </>
      ) : (
        <button onClick={() => connect({ connector: connectors[0] })}>
          [Connect]
        </button>
      )}
    </nav>
  );
}
