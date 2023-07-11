import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

import BuyGloModal from "@/components/Modals/BuyGloModal";

import EnoughToBuy from "./EnoughToBuy";

type Props = {
  openModal: any;
  yearlyYield: number;
  yearlyYieldFormatted: string;
};
export default function ImpactInset({
  openModal,
  yearlyYield,
  yearlyYieldFormatted,
}: Props) {
  return (
    <div className="m-1">
      <button
        className="flex flex-col bg-impact-bg text-impact-fg rounded-[24px] px-5 pb-3 w-full font-normal items-baseline"
        onClick={() => openModal(<BuyGloModal />)}
      >
        <div className="">
          <div className="h-4 w-4 bg-white -rotate-45 transform origin-top-left translate-x-32"></div>
        </div>
        <div className="flex w-full justify-between items-center space-y-2">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Image
              className="pb-[2px] mr-2"
              src="/glo-logo.svg"
              alt="glo"
              height={28}
              width={28}
            />
            {yearlyYieldFormatted} / year
          </motion.div>
          <EnoughToBuy yearlyYield={yearlyYield} />
        </div>
      </button>
    </div>
  );
}
