import { useState } from "react";

import BuyingGuide from "@/components/BuyingGuide";
import DetailedEnoughToBuy from "@/components/DetailedEnoughToBuy";
import Holdings from "@/components/Holdings";
import { getTotalYield, getUSFormattedNumber } from "@/utils";

export default function BuyGloModal() {
  const [glo, setGlo] = useState<number>(1000);
  const [flipped, setFlipped] = useState<boolean>(false);

  const totalDays = 365;
  const yearlyInterestRate = 0.024;
  const yearlyYield = getTotalYield(yearlyInterestRate, glo, totalDays);
  const formattedGlo = getUSFormattedNumber(glo);

  if (flipped) {
    return (
      <div className="flex flex-col max-w-[343px] mb-7">
        <BuyingGuide glo={glo} />
        <button
          className="bg-pine-100 text-pine-900 h-[52px] py-3.5 mx-6"
          onClick={() => setFlipped(false)}
        >
          Buy ${formattedGlo} Glo on Uniswap
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900">
      <Holdings glo={glo} setGlo={setGlo} yearlyYield={yearlyYield} />
      <button
        className="bg-pine-100 text-pine-900 h-[52px] py-3.5 mx-6 mt-6"
        onClick={() => setFlipped(true)}
      >
        Buy ${formattedGlo} Glo on Uniswap
      </button>
      <div className="mb-7">
        <DetailedEnoughToBuy
          className="mt-11 mb-7"
          yearlyYield={yearlyYield}
          glo={glo}
        />
      </div>
    </div>
  );
}
