import { FetchBalanceResult } from "@wagmi/core";
import Image from "next/image";
import { useContext, useState } from "react";
import { useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";
import { customFormatBalance } from "@/utils";

import CharitySelector from "./CharitySelector";
import ImpactInset from "./ImpactInset";
import BuyGloModal from "./Modals/BuyGloModal";
import SwapGate from "./Modals/SwapGate";

type Props = {
  polygonBalance: FetchBalanceResult | undefined;
  ethereumBalance: FetchBalanceResult | undefined;
  celoBalance: FetchBalanceResult | undefined;
  optimismBalance: FetchBalanceResult | undefined;
  arbitrumBalance: FetchBalanceResult | undefined;
  totalBalance: FetchBalanceResult | undefined;
  usdcBalance: FetchBalanceResult | undefined;
  stellarBalance: FetchBalanceResult | undefined;
  baseBalance: FetchBalanceResult | undefined;
  stellarConnected: boolean;
};

export default function Balance({
  polygonBalance,
  ethereumBalance,
  celoBalance,
  optimismBalance,
  arbitrumBalance,
  totalBalance,
  usdcBalance,
  stellarBalance,
  baseBalance,
  stellarConnected,
}: Props) {
  const { openModal } = useContext(ModalContext);

  const [showBalanceDropdown, setShowBalanceDropdown] = useState(false);

  const polygonBalanceFormatted = customFormatBalance(polygonBalance);
  const ethereumBalanceFormatted = customFormatBalance(ethereumBalance);
  const celoBalanceFormatted = customFormatBalance(celoBalance);
  const optimismBalanceFormatted = customFormatBalance(optimismBalance);
  const arbitrumBalanceFormatted = customFormatBalance(arbitrumBalance);
  const totalBalanceFormatted = customFormatBalance(totalBalance);
  const usdcBalanceFormatted = customFormatBalance(usdcBalance);
  const baseBalanceformatted = customFormatBalance(baseBalance);
  const stellarBalanceformatted = customFormatBalance(stellarBalance);
  const { connector } = useAccount();
  const isSequenceWallet = connector?.id === "sequence";
  const isCoinbaseWallet = connector?.id === "coinbaseWalletSDK";

  const formattedUSDC = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.floor(Number(usdcBalance?.formatted)));

  const supportedChains = [
    {
      name: "Ethereum",
      logo: "/ethereum-square-logo.svg",
      balance: ethereumBalanceFormatted,
    },
    {
      name: "Polygon",
      logo: "/polygon-matic-logo.svg",
      balance: polygonBalanceFormatted,
    },
    {
      name: "Celo",
      logo: "/celo-square-logo.svg",
      balance: celoBalanceFormatted,
    },
    {
      name: "Optimism",
      logo: "/optimism-logo.svg",
      balance: optimismBalanceFormatted,
    },
    {
      name: "Arbitrum",
      logo: "/arbitrum-logo.svg",
      balance: arbitrumBalanceFormatted,
    },
    {
      name: "Base",
      logo: "/base-logo.svg",
      balance: baseBalanceformatted,
    },
  ];

  return (
    <div className="bg-white rounded-[20px] pt-4">
      <div className="flex flex-col space-y-2 p-4">
        <div className="self-center text-sm text-pine-700/90 mb-1.5">
          You own
        </div>
        <div
          className={`flex flex-row font-semibold justify-center ${
            stellarConnected ? "" : "cursor-pointer"
          }`}
          onClick={() => {
            stellarConnected
              ? null
              : setShowBalanceDropdown(!showBalanceDropdown);
          }}
        >
          <div className="flex flex-col justify-center items-center relative z-1">
            <div className="flex flex-row text-[2.625rem] items-baseline">
              <div className="max-w-[226px]">
                ${totalBalanceFormatted.fmtBalanceDollarPart}
              </div>
              <div className="text-xl">
                .{totalBalanceFormatted.fmtBalanceCentPart || "00"}
              </div>
            </div>
            {showBalanceDropdown && (
              <div className="absolute top-10 z-10 mt-1 w-[280px] h-[220px] bg-white border-2 border-pine-400/90 rounded-lg">
                <div className="h-4 w-4 bg-white border-white border-t-pine-400/90 border-r-pine-400/90 border-2 -rotate-45 transform origin-top-left translate-x-32"></div>

                <div className="flex flex-col justify-center items-center">
                  {supportedChains.map((chain) => (
                    <div
                      key={chain.name}
                      className="flex flex-row align-middle text-[2.625rem] items-center justify-between w-[200px] mb-2"
                    >
                      <div className="text-sm text-pine-700/90 mb-1.5 w-1/6">
                        <Image
                          alt={`${chain.name} logo`}
                          src={chain.logo}
                          width={20}
                          height={20}
                        />
                      </div>
                      <div className="text-sm text-pine-700/90 mb-1.5 w-1/3">
                        {chain.name}
                      </div>
                      <div className="text-sm text-pine-700/90 mb-1.5 w-1/2 text-right">
                        ${chain.balance.dblFmtBalance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {
          // TODO: Temporary block
          /*usdcBalance && usdcBalance.value > 1000000 && */ <a
            className="text-pine-700 self-center"
            onClick={() => {
              openModal(
                <SwapGate
                  buyAmount={Number(usdcBalanceFormatted.fmtBalanceDollarPart)}
                />
              );
            }}
          >
            <span className="black-link">{formattedUSDC} USDC</span>{" "}
            <span className="invisible-link">swappable for Glo Dollar</span>
          </a>
        }
      </div>

      <div className="flex flex-col">
        <div className="self-center text-sm text-pine-700/90 mb-1.5">
          Generating up to
        </div>
      </div>

      <div className="flex flex-row justify-center">
        <ImpactInset
          openModal={openModal}
          yearlyYield={totalBalanceFormatted.yearlyYield}
          yearlyYieldFormatted={totalBalanceFormatted.yearlyYieldUSFormatted}
          totalBalance={totalBalance}
        />
        {totalBalance && totalBalance.value > 0 && (
          <>
            <div className="self-center text-sm text-pine-700/90 mb-1.5 mx-1">
              for
            </div>
            <CharitySelector />
          </>
        )}
      </div>

      <div className="flex flex-col">
        <div className="self-center text-sm text-pine-700/90 mb-1.5">
          per year
        </div>
      </div>

      <div
        className={`${
          totalBalance?.value ? "bg-pine-50" : "bg-impact-bg"
        } rounded-b-xl border-t-pine-900/10 border-t flex justify-center items-center h-[60px] w-full cursor-pointer`}
        onClick={() =>
          openModal(
            <BuyGloModal
              totalBalance={Number(totalBalanceFormatted.fmtBalanceDollarPart)}
              stellarConnected={stellarConnected}
            />
          )
        }
      >
        <span className="font-bolder">Buy Glo Dollar</span>
        <Image
          className="ml-2"
          alt="Buy Glo"
          src="/arrow-right.svg"
          width={16}
          height={16}
        />
      </div>
    </div>
  );
}
