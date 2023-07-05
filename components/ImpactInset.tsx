import Image from "next/image";

import BuyGloModal from "@/components/Modals/BuyGloModal";

import EnoughToBuy from "./EnoughToBuy";

export default function ImpactInset({
  openModal,
  yearlyYield,
  yearlyYieldFormatted,
}) {
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
