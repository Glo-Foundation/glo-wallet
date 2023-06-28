import Image from "next/image";
import { useEffect, useState, useContext } from "react";
import { useAccount } from "wagmi";

import BuyGloModal from "@/components/Modals/BuyGloModal";
import { ModalContext } from "@/lib/context";
import { getTotalYield } from "@/utils";

import Actions from "./Actions";
import EnoughToBuy from "./EnoughToBuy";

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

      <button
        className="flex flex-col bg-impact-bg text-impact-fg rounded-[24px] mb-1 px-5 pb-3 w-full font-normal items-baseline"
        onClick={() => openModal(<BuyGloModal />)}
      >
        <div className="">
          <div className="h-4 w-4 bg-white -rotate-45 transform origin-top-left translate-x-32"></div>
        </div>
        <div className="flex w-full justify-between items-center space-y-2">
          <div className="flex items-center">
            <Image
              className="pb-[2px] mr-2"
              src="/glo-logo.svg"
              alt="glo"
              height={28}
              width={28}
            />
            {yearlyYieldFormatted} / year
          </div>
          <EnoughToBuy yearlyYield={yearlyYield} />
        </div>
      </button>
    </div>
  );
}
