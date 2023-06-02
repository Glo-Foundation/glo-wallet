import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useConnect, useNetwork, useSwitchNetwork } from "wagmi";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";

import UserAuthModal from "./Modals/UserAuthModal";
import UserInfoModal from "./Modals/UserInfoModal";

type Props = {
  address?: string;
  isConnected: boolean;
};
export default function Header({ address, isConnected }: Props) {
  const { connect, connectors, isLoading } = useConnect();
  const { switchNetwork } = useSwitchNetwork();
  const { chain, chains } = useNetwork();
  const { openModal, closeModal } = useContext(ModalContext);
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  useEffect(() => {
    if (isConnected) {
      closeModal();
    }
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isConnected, isCopiedTooltipOpen]);

  const openUserInfoModal = () => {
    openModal(<UserInfoModal address={address} />);
  };

  const openUserAuthModal = () => {
    openModal(<UserAuthModal />);
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
          <Tooltip
            anchorId="copy-deposit-address"
            content="Copied!"
            noArrow={true}
            isOpen={isCopiedTooltipOpen}
          />
          <button
            id="copy-deposit-address"
            className=""
            onClick={() => {
              navigator.clipboard.writeText(address!);
              setIsCopiedTooltipOpen(true);
            }}
          >
            <span>{sliceAddress(address!)}</span>
          </button>
          <button
            className="primary-button w-11 h-11"
            onClick={() => openUserInfoModal()}
          >
            👤
          </button>
        </>
      ) : (
        <>
          <button
            className="primary-button"
            onClick={() => openUserAuthModal()}
          >
            Log in
          </button>
        </>
      )}
    </nav>
  );
}
