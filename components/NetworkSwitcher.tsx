import { Chain } from "@wagmi/core";
import {
  polygon,
  mainnet,
  celoAlfajores,
  celo,
  optimism,
  optimismSepolia,
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
} from "@wagmi/core/chains";
import Image from "next/image";
import { useRef, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";

import { useOutsideClick } from "@/lib/hooks";
import { getAllowedChains } from "@/lib/utils";

export default function NetworkSwitcher() {
  const { switchChain } = useSwitchChain();
  const { chain } = useAccount();
  const [dropdownActive, setDropdownActive] = useState(false);

  const ref = useRef(null);
  useOutsideClick(ref, () => setDropdownActive(false));

  const getChainLogoPath = (chain: Chain): string => {
    switch (chain.id) {
      case mainnet.id: {
        return "/ethereum-square-logo.svg";
      }
      case polygon.id: {
        return "/polygon-matic-logo.svg";
      }
      case celo.id:
      case celoAlfajores.id: {
        return "/celo-square-logo.svg";
      }
      case optimism.id:
      case optimismSepolia.id: {
        return "/optimism-logo.svg";
      }
      case arbitrum.id:
      case arbitrumSepolia.id: {
        return "/arbitrum-logo.svg";
      }
      case base.id:
      case baseSepolia.id: {
        return "/base-logo.svg";
      }
      default: {
        return "/question-mark.svg";
      }
    }
  };

  const getChainOptions = () => {
    const chains = getAllowedChains();
    return chains.map((chain) => (
      <li
        className="hover:bg-pine-100 px-2 py-2.5 rounded-lg"
        onClick={async () => {
          switchChain({ chainId: chain.id });
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
    <div className="relative mr-2" ref={ref}>
      <div
        className={`rounded-lg hover:bg-white hover:drop-shadow-sm w-9 h-9 z-10 flex justify-center ${
          dropdownActive && "bg-white drop-shadow-sm"
        }`}
        onClick={() => setDropdownActive(!dropdownActive)}
      >
        <Image
          src={chain ? getChainLogoPath(chain) : "/question-mark.svg"}
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
