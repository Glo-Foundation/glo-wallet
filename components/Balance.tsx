import { useContext } from "react";
import { useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";
import { getTotalYield } from "@/utils";

import Actions from "./Actions";
import ImpactInset from "./ImpactInset";

type Props = {
  balance: any;
};

export default function Balance({
  balance = { formatted: "0", value: 0 },
}: Props) {
  const { isConnected } = useAccount();
  const { openModal } = useContext(ModalContext);

  // ethers and typescript don't like each other
  const illFormatMyOwnEther = Number(balance.formatted);
  const yearlyYield = getTotalYield(illFormatMyOwnEther);
  const yearlyYieldFormatted =
    yearlyYield > 0 ? `$0 - ${yearlyYield.toFixed(2)}` : "$0";

  const dblFmtBalance = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(balance.formatted);

  const splitFmtBalance = dblFmtBalance.split(".");
  const fmtBalanceDollarPart = splitFmtBalance[0];
  let fmtBalanceCentPart = splitFmtBalance[1];
  if (fmtBalanceCentPart?.length === 1) fmtBalanceCentPart += "0";

  return (
    <div className="bg-white rounded-[20px] pt-4">
      <div className="flex flex-col space-y-2 p-4">
        <div className="self-center text-sm text-pine-700/90 mb-1.5">
          Balance
        </div>
        <div className="flex flex-row font-semibold justify-center">
          <div className="flex flex-row text-[2.625rem] items-baseline">
            <div className="max-w-[226px]">${fmtBalanceDollarPart}</div>
            <div className="text-xl">.{fmtBalanceCentPart || "00"}</div>
          </div>
        </div>
      </div>
      {isConnected && <Actions />}
      <ImpactInset
        openModal={openModal}
        yearlyYield={yearlyYield}
        yearlyYieldFormatted={yearlyYieldFormatted}
      />
    </div>
  );
}
