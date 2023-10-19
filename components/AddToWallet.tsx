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
import { useRef, useState } from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";

import { chainConfig } from "@/lib/config";
import { useOutsideClick } from "@/lib/hooks";
import { getAllowedChains } from "@/lib/utils";

export default function AddToWallet() {
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();
  const [dropdownActive, setDropdownActive] = useState(false);

  const ref = useRef(null);
  useOutsideClick(ref, () => setDropdownActive(false));

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

  const addTokenToWallet = (chain: Chain) => {
    try {
      window.ethereum
        .request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20", // Initially only supports ERC20, but eventually more!
            options: {
              address: chainConfig[chain.id], // The address that the token is at.
              symbol: "USDGLO", // A ticker symbol or shorthand, up to 5 chars.
              decimals: 18, // The number of decimals in the token
              image: "https://app.glodollar.org/glo-logo.svg", // A string url of the token logo
            },
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
  };

  const getChainOptions = () => {
    const chains = getAllowedChains();
    return chains.map((chain) => (
      <li
        className="hover:bg-pine-100 px-2 py-2.5 rounded-lg"
        onClick={() => {
          switchNetwork?.(chain.id);
          addTokenToWallet(chain);
          setDropdownActive(false);
        }}
        key={chain.id}
      >
        <div className="flex flex-row space-x-2">
          <Image
            src={getChainLogoPath(chain)}
            alt={`${chain.name}-logo`}
            height={18}
            width={18}
          />
          <div>{chain.name}</div>
        </div>
      </li>
    ));
  };

  return (
    <div className="relative ml-2" ref={ref}>
      <div
        className={`rounded-lg hover:bg-white hover:drop-shadow-sm w-9 h-9 z-10 flex justify-center ${
          dropdownActive && "bg-white drop-shadow-sm"
        }`}
        onClick={() => setDropdownActive(!dropdownActive)}
      >
        <Image
          src={"/metamask.svg"}
          alt={`${chain ? chain.name : "unknown-chain"}-logo`}
          height={18}
          width={18}
        />
      </div>
      {dropdownActive && (
        <div className="absolute p-2 bg-white rounded-lg w-52 drop-shadow-sm mt-1">
          <ul>{getChainOptions()}</ul>
        </div>
      )}
    </div>
  );
}
