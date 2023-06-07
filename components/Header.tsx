import { sequence } from "0xsequence";
import Image from "next/image";
import { useContext, useEffect } from "react";
import { useConnect, useNetwork, useSwitchNetwork } from "wagmi";

import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { sliceAddress } from "@/lib/utils";

import UserInfoModal from "./Modals/UserInfoModal";

type Props = {
  address?: string;
  isConnected: boolean;
};
export default function Header({ address, isConnected }: Props) {
  const { connect, connectors, isLoading } = useConnect();
  const { switchNetwork } = useSwitchNetwork();
  const { chain, chains } = useNetwork();
  const { openModal } = useContext(ModalContext);
  const { setEmail } = useUserStore();

  const receive = () => {
    openModal(<UserInfoModal address={address} />);
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
        <>
          <button
            className="primary-button"
            onClick={async () => {
              const wallet = await sequence.initWallet("mumbai");
              const connectDetails = await wallet.connect({
                app: "Glo Wallet",
                askForEmail: true,
              });
            }}
          >
            Social
          </button>

          <button
            className="primary-button"
            onClick={() => connect({ connector: connectors[1] })}
          >
            Metamask
          </button>

          <button
            className="primary-button"
            onClick={() => connect({ connector: connectors[2] })}
          >
            WC
          </button>
        </>
      )}
    </nav>
  );
}
