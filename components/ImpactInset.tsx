import { FetchBalanceResult } from "@wagmi/core";
import { motion } from "framer-motion";

import BuyGloModal from "@/components/Modals/BuyGloModal";
import { customFormatBalance } from "@/utils";

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
        className={`flex flex-col ${bgColorClass} border-2 border-cyan-600 text-impact-fg rounded-[36px] h-[32px] px-2 py-5 font-normal items-baseline`}
        onClick={() => openModal(<BuyGloModal totalBalance={1000} />)}
      >
        <div className="flex w-full justify-center items-center space-y-2">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <GloAnimated totalBalance={totalBalance} />
            <p className="ml-2 text-sm">{yearlyYieldFormatted}</p>
          </motion.div>
        </div>
      </button>
    </div>
  );
}
