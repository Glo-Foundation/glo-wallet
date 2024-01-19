import Head from "next/head";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useConnect, useAccount } from "wagmi";

import AddToWallet from "@/components/AddToWallet";
import NetworkSwitcher from "@/components/NetworkSwitcher";
import { ModalContext } from "@/lib/context";
import { useFreighter } from "@/lib/hooks";
import { sliceAddress } from "@/lib/utils";

import UserAuthModal from "./Modals/UserAuthModal";
import UserInfoModal from "./Modals/UserInfoModal";

export default function Header({ idrissName }: { idrissName: string }) {
  const { isLoading } = useConnect();
  const { address, isConnected, connector } = useAccount();
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const { openModal } = useContext(ModalContext);
  const isWalletIdriss = !!idrissName;
  const isSequenceWallet = connector?.id === "sequence";
  const { isFreighterConnected, freighterAddress } = useFreighter();

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const openUserInfoModal = (userAddress) => {
    openModal(<UserInfoModal address={address} idrissName={idrissName} />);
  };

  const openUserAuthModal = () => {
    openModal(<UserAuthModal />, "bg-transparent");
  };

  return (
    <>
      <Head>
        <title>Glo Dollar App</title>
      </Head>

      <nav className="mt-4 mb-6 flex justify-between items-center">
        <a href="https://glodollar.org/" target="_blank" rel="noreferrer">
          <Image
            src="/glo-logo-text.svg"
            alt="glo logo"
            width={74}
            height={26}
          />
        </a>

        {isLoading ? (
          <button className="primary-button">Connecting... </button>
        ) : isConnected ? (
          <div className="flex z-10">
            {!isSequenceWallet ? <AddToWallet /> : ""}
            <NetworkSwitcher />
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
                navigator.clipboard.writeText(idrissName!);
                setIsCopiedTooltipOpen(true);
              }}
            >
              {idrissName || sliceAddress(address!)}
            </button>
            <button
              className="primary-button w-9 h-9"
              onClick={() => openUserInfoModal(address)}
              data-testid="profile-button"
            >
              👤
            </button>
          </div>
        ) : isFreighterConnected ? (
          <div className="flex z-10">
            <button
              data-tooltip-id="copy-wallet-tooltip"
              data-tooltip-content="Copied!"
              className="text-sm text-pine-800 mr-3 font-normal"
              onClick={() => {
                navigator.clipboard.writeText(freighterAddress);
                setIsCopiedTooltipOpen(true);
              }}
            >
              {sliceAddress(freighterAddress)}
            </button>
            <button
              className="primary-button w-9 h-9"
              onClick={() => openUserInfoModal(freighterAddress)}
              data-testid="profile-button"
            >
              👤
            </button>
          </div>
        ) : (
          <div className="flex">
            <button
              className="primary-button mr-2"
              data-testid="primary-login-button"
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
    </>
  );
}
