import Image from "next/image";

import { getTotalYield } from "@/utils";

import Actions from "./Actions";
import EnoughToBuy from "./EnoughToBuy";

type Props = {
  balance: any;
  isLoading: boolean;
  isConnected: boolean;
};

export default function Balance({
  balance = { formatted: "0", value: 0 },
  address = "0x0",
  isLoading,
  isConnected,
}: Props) {
  const totalDays = 365;
  const yearlyInterestRate = 0.027;
  const yearlyYield = getTotalYield(
    yearlyInterestRate,
    balance.value,
    totalDays
  );

  console.log({ yearlyYield });
  const formattedYearlyYield = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(yearlyYield);

  const splitFmtBalance = balance.formatted.split(".");
  const fmtBalanceDollarPart = splitFmtBalance[0];
  const fmtBalanceCentPart = splitFmtBalance[1];

  return (
    <div className="bg-white rounded-[20px] pt-4">
      <div className="flex flex-col space-y-2 p-4">
        <div className="self-center text-[1.1rem] text-pine-700/90">
          Balance
        </div>
        <div className="flex flex-row font-semibold justify-center">
          <div className="flex flex-row text-[2.625rem] items-baseline">
            <div className="max-w-[226px]">{fmtBalanceDollarPart}</div>
            <div className="text-xl">.{fmtBalanceCentPart || "00"}</div>
          </div>
        </div>
      </div>
      <Actions />
      <div className="flex flex-col bg-cyan-600/20 rounded-[24px] mx-1 mb-1 px-5 pb-3">
        <div className="overflow-hidden">
          <div className="h-4 w-4 bg-white -rotate-45 transform origin-top-left translate-x-36"></div>
        </div>
        <div className="flex w-full justify-between items-center space-y-2">
          <div>
            <Image
              className="inline mr-2 align-botom"
              src="/glo-logo.svg"
              alt="glo"
              height={28}
              width={28}
            />
            ${formattedYearlyYield} / year
          </div>
          <EnoughToBuy yearlyYield={yearlyYield} />
        </div>
      </div>
    </div>
  );
}
