import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useConnect, useNetwork, useSwitchNetwork, useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { sliceAddress } from "@/lib/utils";

import UserAuthModal from "./Modals/UserAuthModal";
import UserInfoModal from "./Modals/UserInfoModal";

export default function Header() {
  const { connect, connectors, isLoading } = useConnect();
  const { address, isConnected } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const { chain, chains } = useNetwork();
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const { openModal, closeModal } = useContext(ModalContext);

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const openUserInfoModal = () => {
    openModal(<UserInfoModal address={address} />);
  };

  const openUserAuthModal = () => {
    openModal(<UserAuthModal />, "bg-transparent");
  };

  return (
    <nav className="mt-4 mb-6 flex justify-between items-center">
      <a href="https://glodollar.org/">
        <Image src="/glo-logo-text.svg" alt="glo logo" width={74} height={26} />
      </a>

      {isLoading ? (
        <button className="primary-button">Connecting... </button>
      ) : isConnected ? (
        <div className="flex">
          <Tooltip
            id="copy-wallet-tooltip"
            content="Copied!"
            isOpen={isCopiedTooltipOpen}
          />
          <button
            data-tooltip-id="copy-wallet-tooltip"
            data-tooltip-content="Copied!"
            className="text-sm text-pine-800 mr-3 font-normal"
            onClick={() => {
              navigator.clipboard.writeText(address!);
              setIsCopiedTooltipOpen(true);
            }}
          >
            {sliceAddress(address!)}
          </button>
          <button
            className="primary-button w-9 h-9"
            onClick={() => openUserInfoModal()}
          >
            👤
          </button>
        </div>
      ) : (
        <div className="flex">
          <button
            className="primary-button mr-2"
            onClick={() => openUserAuthModal()}
          >
            Log in
          </button>
          <a
            target="_blank"
            href="https://www.notion.so/Glo-FAQ-946e21901e934fc19992df43a3008077"
            rel="noreferrer"
          >
            <button className="secondary-button">?</button>
          </a>
        </div>
      )}
    </nav>
  );
}
