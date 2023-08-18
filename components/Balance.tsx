import { FetchBalanceResult } from "@wagmi/core";
import Image from "next/image";
import { useContext, useState } from "react";

import { ModalContext } from "@/lib/context";
import { getTotalYield } from "@/utils";

import ImpactInset from "./ImpactInset";

type Props = {
  polygonBalance: FetchBalanceResult | undefined;
  ethereumBalance: FetchBalanceResult | undefined;
  celoBalance: FetchBalanceResult | undefined;
  totalBalance: FetchBalanceResult | undefined;
};

const customFormatBalance = (
  balance: FetchBalanceResult | undefined
): {
  yearlyYield: number;
  yearlyYieldFormatted: string;
  dblFmtBalance: string;
  fmtBalanceDollarPart: string;
  fmtBalanceCentPart: string;
} => {
  const yearlyYield = getTotalYield(Number(balance ? balance.formatted : 0));
  const yearlyYieldFormatted =
    yearlyYield > 0 ? `$0 - ${yearlyYield.toFixed(2)}` : "$0";

  const dblFmtBalance = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(balance ? balance.formatted : 0));

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
}: Props) {
  const { openModal } = useContext(ModalContext);

  const [showBalanceDropdown, setShowBalanceDropdown] = useState(false);

  const polygonBalanceFormatted = customFormatBalance(polygonBalance);
  const ethereumBalanceFormatted = customFormatBalance(ethereumBalance);
  const celoBalanceFormatted = customFormatBalance(celoBalance);
  const totalBalanceFormatted = customFormatBalance(totalBalance);

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
          <div className="flex flex-col justify-center items-center relative z-10">
            <div className="flex flex-row text-[2.625rem] items-baseline">
              <div className="max-w-[226px]">
                ${totalBalanceFormatted.fmtBalanceDollarPart}
              </div>
              <div className="text-xl">
                .{totalBalanceFormatted.fmtBalanceCentPart || "00"}
              </div>
            </div>
            {showBalanceDropdown && (
              <div className="absolute top-10 z-100 mt-1 w-[280px] h-[120px] bg-white border-2 border-pine-400/90 rounded-lg">
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
      </div>

      <ImpactInset
        openModal={openModal}
        yearlyYield={totalBalanceFormatted.yearlyYield}
        yearlyYieldFormatted={totalBalanceFormatted.yearlyYieldFormatted}
      />
    </div>
  );
}
