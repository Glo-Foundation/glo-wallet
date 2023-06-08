import { useState } from "react";

import BuyingGuide from "@/components/BuyingGuide";
import DetailedEnoughToBuy from "@/components/DetailedEnoughToBuy";
import Holdings from "@/components/Holdings";
import { getTotalYield } from "@/utils";

export default function BuyModal({ close }: { close: () => any }) {
  const [glo, setGlo] = useState<number>(1000);
  const [flipped, setFlipped] = useState<boolean>(false);

  const totalDays = 365;
  const yearlyInterestRate = 0.027;
  const yearlyYield = getTotalYield(yearlyInterestRate, glo, totalDays);

  if (flipped) {
    return (
      <div className="flex flex-col max-w-[343px] min-h-[600px] mb-7">
        <BuyingGuide glo={glo} closeModal={close} />
        <button
          className="bg-pine-100 text-pine-900 h-[52px] py-3.5 mx-6"
          onClick={() => setFlipped(false)}
        >
          Buy ${glo} Glo on Uniswap
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-[343px] min-h-[700px]">
      <Holdings
        glo={glo}
        setGlo={setGlo}
        yearlyYield={yearlyYield}
        closeModal={close}
      />
      <DetailedEnoughToBuy yearlyYield={yearlyYield} glo={glo} />
      <button
        className="bg-pine-100 text-pine-900 h-[52px] py-3.5 mx-6 mt-11 mb-7"
        onClick={() => setFlipped(true)}
      >
        Buy ${glo} Glo on Uniswap
      </button>
    </div>
  );
}
