import { FetchBalanceResult } from "@wagmi/core";
import { motion } from "framer-motion";

import BuyGloModal from "@/components/Modals/BuyGloModal";

import EnoughToBuy from "./EnoughToBuy";
import GloAnimated from "./GloAnimated";

type Props = {
  openModal: (content: JSX.Element) => void;
  yearlyYield: number;
  yearlyYieldFormatted: string;
  totalBalance: FetchBalanceResult | undefined;
};

export default function ImpactInset({
  openModal,
  yearlyYield,
  yearlyYieldFormatted,
  totalBalance,
}: Props) {
  const bgColorClass = totalBalance?.value ? "bg-impact-bg" : "bg-pine-100";

  return (
    <div className="m-1 relative z-0 flex justify-center">
      <button
        className={`flex flex-col ${bgColorClass} text-impact-fg rounded-[36px] h-[32px] mb-3 px-5 py-7 w-[95%] font-normal items-baseline`}
        onClick={() => openModal(<BuyGloModal />)}
      >
        <div className="">
          <div className="fixed h-[13px] w-[13px] bg-white -rotate-45 transform origin-top-left translate-x-[124px] -translate-y-4"></div>
        </div>
        <div className="flex w-full justify-between items-center space-y-2">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <GloAnimated totalBalance={totalBalance} />
            <p className="ml-2">{yearlyYieldFormatted} / year</p>
          </motion.div>
          <EnoughToBuy yearlyYield={yearlyYield} />
        </div>
      </button>
    </div>
  );
}
