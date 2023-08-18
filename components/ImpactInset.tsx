import { motion } from "framer-motion";

import BuyGloModal from "@/components/Modals/BuyGloModal";

import EnoughToBuy from "./EnoughToBuy";
import GloAnimated from "./GloAnimated";

type Props = {
  openModal: (content: JSX.Element) => void;
  yearlyYield: number;
  yearlyYieldFormatted: string;
};
export default function ImpactInset({
  openModal,
  yearlyYield,
  yearlyYieldFormatted,
}: Props) {
  return (
    <div className="mx-6 mb-6">
      <button
        className="flex flex-row bg-impact-bg justify-between text-impact-fg rounded-[24px] px-5 w-full font-normal items-baseline min-h-8"
        onClick={() => openModal(<BuyGloModal />)}
      >
        <motion.div
          className="flex flex-row items-center space-x-1 py-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <GloAnimated />
          <p className="text-sm">{yearlyYieldFormatted} / year</p>
        </motion.div>
        <EnoughToBuy yearlyYield={yearlyYield} />
      </button>
    </div>
  );
}
