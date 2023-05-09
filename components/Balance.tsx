import Image from 'next/image';
import EnoughToBuy from './EnoughToBuy';

type Props = {
  glo: number;
  setGlo: React.Dispatch<React.SetStateAction<number>>;
  yearlyYield: number;
};

export default function Balance({ glo, setGlo, yearlyYield }: Props) {
  const formattedGlo = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(glo);
  const formattedYearlyYield = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(yearlyYield);

  const splitFmtGlo = formattedGlo.split(".");
  const fmtGloDollarPart = splitFmtGlo[0];
  const fmtGloCentPart = splitFmtGlo[1];

  return (
    <div className="bg-white rounded-[20px] pt-4">
      <div className="flex flex-col space-y-2 p-4">
      <div className="self-center text-[1.1rem] text-pine-700/90">Balance</div>
        <div className="flex flex-row font-semibold justify-center">
          <div className="flex flex-row text-[2.625rem] items-baseline">
            <div className="max-w-[226px]">
              {fmtGloDollarPart}
            </div>
            <div className="text-xl">
              .{fmtGloCentPart}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-cyan-600/20 rounded-[24px] mx-1 mb-1 px-5 pb-3">
        <div className="overflow-hidden">
          <div className="h-3.5 w-3.5 bg-white -rotate-45 transform origin-top-left translate-x-36"></div>
        </div>
        <div className="flex w-full justify-between space-y-2">
          <div>
            <Image className="inline mr-2 align-botom" src="/glo-logo.svg" height={28} width={28} />
            ${formattedYearlyYield} / year
          </div>
          <EnoughToBuy yearlyYield={yearlyYield} />
        </div>
      </div>
    </div>
  );
}
