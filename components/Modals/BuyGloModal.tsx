import { useContext, useState } from "react";

import DetailedEnoughToBuy from "@/components/DetailedEnoughToBuy";
import Holdings from "@/components/Holdings";
import { ModalContext } from "@/lib/context";
import { getTotalYield, getUSFormattedNumber } from "@/utils";

import PaymentOptionModal from "./PaymentOptionModal";

export default function BuyGloModal({
  totalBalance,
  stellarConnected = false,
}: {
  totalBalance: number;
  stellarConnected?: boolean;
}) {
  const { openModal } = useContext(ModalContext);

  const [glo, setGlo] = useState<number>(
    totalBalance !== 0 ? totalBalance : 1000
  );

  let yearlyYield = getTotalYield(glo);
  // round down to 0 when the yield isn't even $1
  if (yearlyYield < 1) {
    yearlyYield = 0;
  }
  const formattedGlo = getUSFormattedNumber(glo);

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900">
      <Holdings glo={glo} setGlo={setGlo} yearlyYield={yearlyYield} />
      <button
        className="bg-cyan-600 text-pine-900 h-[52px] py-3.5 mx-6 mt-6 mb-6"
        disabled={glo === 0}
        onClick={() =>
          openModal(
            <PaymentOptionModal
              buyAmount={Math.floor(glo)}
              stellarConnected={stellarConnected}
            />
          )
        }
      >
        Buy ${formattedGlo} Glo Dollar
      </button>
      {/*<div className="mb-7">
        <DetailedEnoughToBuy
          yearlyYield={yearlyYield}
          noImpactCopyText="Pick a value above $0 to see how much impact you could make."
        />
      </div>*/}
    </div>
  );
}
