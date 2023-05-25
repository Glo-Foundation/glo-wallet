import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useContext, useEffect } from "react";
import { useConnect, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { torusPlugin } from "@/lib/web3uath";

type Props = {
  address?: string;
  isConnected: boolean;
};
export default function Header({ address, isConnected }: Props) {
  const { connect, connectors, isLoading } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchNetwork } = useSwitchNetwork();
  const { chain, chains } = useNetwork();
  const { openModal } = useContext(ModalContext);

  const connector = connectors[0];

  useEffect(() => {
    if (!isConnected && connector) {
      connect({ connector });
    }
  }, []);

  const receive = async () => {
    openModal(
      <div className="flex flex-col items-center">
        <QRCodeSVG size={128} value={address!} />
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
      {isLoading ? (
        <button className="primary-button">Connecting... </button>
      ) : isConnected ? (
        <>
          <span className="cursor-pointer" onClick={() => receive()}>
            {sliceAddress(address!)}
          </span>
          <button className="primary-button" onClick={() => disconnect()}>
            Log out
          </button>
        </>
      ) : (
        <button
          className="primary-button"
          onClick={() => connect({ connector: connectors[0] })}
        >
          Log in
        </button>
      )}
      <button
        className="primary-button"
        onClick={() => {
          torusPlugin.torusWalletInstance.hideTorusButton();
        }}
      >
        {chain?.name || "Chain..."}
      </button>
    </nav>
  );
}
