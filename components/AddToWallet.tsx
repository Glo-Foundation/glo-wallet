import { Chain } from "@wagmi/core";
import {
  polygon,
  mainnet,
  polygonMumbai,
  goerli,
  celoAlfajores,
  celo,
} from "@wagmi/core/chains";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useNetwork, useSwitchNetwork, useWalletClient } from "wagmi";

import { chainConfig } from "@/lib/config";
import { useOutsideClick } from "@/lib/hooks";
import { getAllowedChains } from "@/lib/utils";

export default function AddToWallet() {
  const { chain } = useNetwork();
  const { data: walletClient } = useWalletClient();
  const [isAddToWalletTooltipOpen, setIsAddToWalletTooltipOpen] =
    useState(false);

  const getChainLogoPath = (chain: Chain): string => {
    switch (chain.id) {
      case mainnet.id:
      case goerli.id: {
        return "/ethereum-square-logo.svg";
      }
      case polygon.id:
      case polygonMumbai.id: {
        return "/polygon-matic-logo.svg";
      }
      case celo.id:
      case celoAlfajores.id: {
        return "/celo-square-logo.svg";
      }
      default: {
        return "/question-mark.svg";
      }
    }
  };

  function addTokenToWallet(chain: Chain) {
    try {
      walletClient
        ?.watchAsset({
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: chainConfig[chain.id], // The address that the token is at.
            symbol: "USDGLO", // A ticker symbol or shorthand, up to 5 chars.
            decimals: 18, // The number of decimals in the token
            image: "https://app.glodollar.org/glo-logo.svg", // A string url of the token logo
          },
        })
        .then(() => {
          console.log("Thanks for your interest!");
        })
        .catch(() => {
          console.log("Your loss!");
        });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="relative ml-2">
      <Tooltip
        id="add-to-wallet-tooltip"
        content="Add to wallet"
        isOpen={isAddToWalletTooltipOpen}
      />
      <div
        className={`rounded-lg hover:bg-white hover:drop-shadow-sm w-9 h-9 z-10 flex justify-center`}
        onMouseOver={() => setIsAddToWalletTooltipOpen(true)}
        onMouseOut={() => setIsAddToWalletTooltipOpen(false)}
        onClick={() => (chain ? addTokenToWallet(chain) : "")}
        data-tooltip-id="add-to-wallet-tooltip"
        data-tooltip-content="Add to wallet"
      >
        <Image
          src={"/metamask.svg"}
          alt={`metamask-logo`}
          height={18}
          width={18}
        />
      </div>
    </div>
  );
}
