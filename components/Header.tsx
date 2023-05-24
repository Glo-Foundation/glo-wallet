import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useContext, useEffect } from "react";
import { useConnect, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";

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
      <div className="px-4">
        <section className="flex items-center">
          <div className="p-4 border-2">
            <QRCodeSVG size={128} value={address!} />
          </div>
          <div className="ml-6">
            <h3 className="text-l max-w-[50%] flex flex-wrap">
              Wallet Address:
            </h3>
            <div className="copy pseudo-input-text">
              <span>{address}</span>
              <button
                id="copy-deposit-address"
                className="pl-2"
                onClick={() => {
                  navigator.clipboard.writeText(address);
                }}
              >
                <Image
                  layout="fixed"
                  src={`/copy.svg`}
                  height={15}
                  width={15}
                  alt=""
                />
              </button>
            </div>
          </div>
        </section>
        <section className="mt-4 flex justify-end">
          <button className="primary-button" onClick={() => disconnect()}>
            Log out
          </button>
        </section>
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
          <span className="cursor-default">{sliceAddress(address!)}</span>
          <button
            className="primary-button w-11 h-11"
            onClick={() => receive()}
          >
            👤
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
    </nav>
  );
}
