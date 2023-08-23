import { FetchBalanceResult } from "@wagmi/core";
import Image from "next/image";
import { useContext, useState } from "react";

import BuyWithCoinbaseModal from "@/components/Modals/BuyWithCoinbaseModal";
import { ModalContext } from "@/lib/context";
import { getTotalYield } from "@/utils";

import ImpactInset from "./ImpactInset";
import BuyGloModal from "./Modals/BuyGloModal";

type Props = {
  polygonBalance: number | undefined;
  ethereumBalance: number | undefined;
  celoBalance: number | undefined;
  totalBalance: number | undefined;
  usdcBalance: FetchBalanceResult | undefined;
};

const customFormatBalance = (
  balance: number
): {
  yearlyYield: number;
  yearlyYieldFormatted: string;
  dblFmtBalance: string;
  fmtBalanceDollarPart: string;
  fmtBalanceCentPart: string;
} => {
  if (!balance) {
    return {
      yearlyYield: 0,
      yearlyYieldFormatted: "0",
      dblFmtBalance: "0",
      fmtBalanceDollarPart: "0",
      fmtBalanceCentPart: "00",
    };
  }
  const yearlyYield = getTotalYield(balance);
  const yearlyYieldFormatted =
    yearlyYield > 0 ? `$0 - ${yearlyYield.toFixed(2)}` : "$0";

  const dblFmtBalance = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(balance);

  const splitFmtBalance = dblFmtBalance.split(".");
  const fmtBalanceDollarPart = splitFmtBalance[0];
  let fmtBalanceCentPart = splitFmtBalance[1];
  if (fmtBalanceCentPart?.length === 1) fmtBalanceCentPart += "0";

  return {
    yearlyYield,
    yearlyYieldFormatted,
    dblFmtBalance,
    fmtBalanceDollarPart,
    fmtBalanceCentPart,
  };
};

export default function Balance({
  polygonBalance,
  ethereumBalance,
  celoBalance,
  totalBalance,
  usdcBalance,
}: Props) {
  const { openModal } = useContext(ModalContext);

  const [showBalanceDropdown, setShowBalanceDropdown] = useState(false);

  const polygonBalanceFormatted = customFormatBalance(polygonBalance as number);
  const ethereumBalanceFormatted = customFormatBalance(
    ethereumBalance as number
  );
  const celoBalanceFormatted = customFormatBalance(celoBalance as number);
  const totalBalanceFormatted = customFormatBalance(totalBalance as number);

  const formattedUSDC = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(usdcBalance?.formatted));

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
  ];

  return (
    <div className="bg-white rounded-[20px] pt-4">
      <div className="flex flex-col space-y-2 p-4">
        <div className="self-center text-sm text-pine-700/90 mb-1.5">
          Balance
        </div>
        <div
          className="flex flex-row font-semibold justify-center cursor-pointer"
          onClick={() => {
            setShowBalanceDropdown(!showBalanceDropdown);
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
              <div className="absolute top-10 z-10 mt-1 w-[280px] h-[120px] bg-white border-2 border-pine-400/90 rounded-lg">
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
        {usdcBalance && usdcBalance.value > 0 && (
          <a
            className="black-link self-center"
            onClick={() => {
              openModal(
                <BuyWithCoinbaseModal
                  buyAmount={Number(totalBalanceFormatted.fmtBalanceDollarPart)}
                />
              );
            }}
          >
            ({formattedUSDC} USDC swappable for Glo Dollar)
          </a>
        )}
      </div>

      <ImpactInset
        openModal={openModal}
        yearlyYield={totalBalanceFormatted.yearlyYield}
        yearlyYieldFormatted={totalBalanceFormatted.yearlyYieldFormatted}
        totalBalance={totalBalance}
      />

      <div
        className={`${
          totalBalance && totalBalance > 0 ? "bg-pine-50" : "bg-impact-bg"
        } rounded-b-xl border-t-pine-900/10 border-t flex justify-center items-center h-[60px] w-full cursor-pointer`}
        onClick={() => openModal(<BuyGloModal />)}
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
