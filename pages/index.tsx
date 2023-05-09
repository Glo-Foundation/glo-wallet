import Navbar from "@/components/Navbar";
import JoinTheMovement from "@/components/JoinTheMovement";
import EnoughToBuy from "@/components/EnoughToBuy";
import Balance from "@/components/Balance";
import { useState } from "react";
import { getTotalYield } from "@/utils";

export default function Home() {
  const [glo, setGlo] = useState<number>(1000);

  const totalDays = 365;
  const yearlyInterestRate = 0.027;
  const yearlyYield = getTotalYield(yearlyInterestRate, glo, totalDays);

  return (
    <div className="mt-4 px-2.5">
      <Navbar />
      <div className="font-semibold text-[1.75rem] mb-4">Impact calculator</div>
      <div className="mb-8">
        Calculate how you can help end extreme poverty by owning Glo.
      </div>
      <div className="flex flex-col space-y-10">
        <Balance glo={glo} setGlo={setGlo} yearlyYield={yearlyYield} />
        <EnoughToBuy yearlyYield={yearlyYield} />
        <JoinTheMovement isIframe={false} />
      </div>
    </div>
  );
}
