import { useContext, useState } from "react";
import { useAccount } from "wagmi";

import BuyingGuide from "@/components/BuyingGuide";
import DetailedEnoughToBuy from "@/components/DetailedEnoughToBuy";
import Holdings from "@/components/Holdings";
import { ModalContext } from "@/lib/context";
import { getTotalYield, getUSFormattedNumber } from "@/utils";

import PaymentOptionModal from "./PaymentOptionModal";

export default function BuyGloModal() {
  const { connector } = useAccount();
  const isSequenceWallet = connector?.id === "sequence";

  const { openModal } = useContext(ModalContext);

  const [glo, setGlo] = useState<number>(1000);
  const [flipped, setFlipped] = useState<boolean>(false);

  const yearlyYield = getTotalYield(glo);
  const formattedGlo = getUSFormattedNumber(glo);

  if (flipped) {
    return (
      <div className="flex flex-col max-w-[343px] mb-7">
        <BuyingGuide glo={glo} />
        <a
          className="flex justify-center items-center rounded-full font-black bg-cyan-600 text-pine-900 h-[52px] mx-6"
          onClick={() => openModal(<PaymentOptionModal />, "payment-dialog")}
        >
          Buy ${formattedGlo} Glo Dollar
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900">
      <Holdings glo={glo} setGlo={setGlo} yearlyYield={yearlyYield} />
      <button
        className="bg-cyan-600 text-pine-900 h-[52px] py-3.5 mx-6 mt-6"
        disabled={glo === 0}
        onClick={() =>
          isSequenceWallet
            ? setFlipped(true)
            : openModal(<PaymentOptionModal />, "payment-dialog")
        }
      >
        Buy ${formattedGlo} Glo Dollar
      </button>
      <div className="mb-7">
        <DetailedEnoughToBuy yearlyYield={yearlyYield} glo={glo} />
      </div>
    </div>
  );
}
