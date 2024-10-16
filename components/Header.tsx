import Head from "next/head";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useConnect, useAccount } from "wagmi";

import AddToWallet from "@/components/AddToWallet";
import NetworkSwitcher from "@/components/NetworkSwitcher";
import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { sliceAddress } from "@/lib/utils";

import UserAuthModal from "./Modals/UserAuthModal";
import UserInfoModal from "./Modals/UserInfoModal";

export default function Header({
  idrissName,
  ensName,
  stellarConnected,
  stellarAddress,
  setStellarConnected,
  setStellarAddress,
}: {
  idrissName: string;
  ensName: string;
  stellarConnected: boolean;
  stellarAddress: string;
  setStellarConnected: (bool: boolean) => void;
  setStellarAddress: (str: string) => void;
}) {
  const { isLoading } = useConnect();
  const { address, isConnected, connector } = useAccount();
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const { openModal } = useContext(ModalContext);
  const { setRecipientsView } = useUserStore();

  const isSequenceWallet = connector?.id === "sequence";

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const openUserInfoModal = (userAddress: string | undefined) => {
    openModal(
      <UserInfoModal
        address={userAddress}
        idrissName={idrissName}
        ensName={ensName}
        stellarConnected={stellarConnected}
        setStellarConnected={setStellarConnected}
        setStellarAddress={setStellarAddress}
      />
    );
  };

  const openUserAuthModal = () => {
    openModal(
      <UserAuthModal
        setStellarConnected={setStellarConnected}
        setStellarAddress={setStellarAddress}
      />,
      "bg-transparent"
    );
  };

  return (
    <>
      <Head>
        <title>Glo Dollar App</title>
      </Head>

      <nav className="mt-4 mb-6 flex justify-between items-center">
        <a className="cursor-pointer" onClick={() => setRecipientsView(false)}>
          <Image
            src="/glo-logo.png"
            alt="glo logo"
            width={34}
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
                navigator.clipboard.writeText(
                  ensName || idrissName || address!
                );
                setIsCopiedTooltipOpen(true);
              }}
            >
              {ensName || idrissName || sliceAddress(address!)}
            </button>
            <button
              className="primary-button w-9 h-9"
              onClick={() => openUserInfoModal(address?.toString())}
              data-testid="profile-button"
            >
              👤
            </button>
          </div>
        ) : stellarConnected ? (
          <div className="flex z-10">
            <button
              data-tooltip-id="copy-wallet-tooltip"
              data-tooltip-content="Copied!"
              className="text-sm text-pine-800 mr-3 font-normal"
              onClick={() => {
                navigator.clipboard.writeText(stellarAddress || "");
                setIsCopiedTooltipOpen(true);
              }}
            >
              {sliceAddress(stellarAddress || "")}
            </button>
            <button
              className="primary-button w-9 h-9"
              onClick={() => openUserInfoModal(stellarAddress || undefined)}
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
          </div>
        )}
      </nav>
    </>
  );
}
