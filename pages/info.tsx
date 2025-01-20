import { infoCards } from "@/components/Info/data";
import { InfoCard } from "@/components/Info/InfoCard";
import { LargestCurrentHolderTable } from "@/components/Info/TableCurrentholders";
import { DelegateTable } from "@/components/Info/TableDelegate";
import { LargestMonthlyHolderTable } from "@/components/Info/TableMonthly";

export default function InfoPage() {
  return (
    <div className="mt-4 px-4 bg-pine-100">
      <div className="grid grid-cols-2 gap-3">
        {infoCards.map((val, i) => (
          <InfoCard key={i} data={val} />
        ))}
      </div>
      <div className="my-5">
        <DelegateTable />
        <LargestMonthlyHolderTable />
        <LargestCurrentHolderTable />
      </div>
    </div>
  );
}
