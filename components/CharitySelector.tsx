import Image from "next/image";
import useSWR from "swr";

import CharitySelectorModal from "@/components/Modals/CharitySelectorModal";
import { getCurrentSelectedCharity } from "@/fetchers";
import { CHARITY_MAP } from "@/lib/utils";

type Props = {
  openModal: (content: JSX.Element) => void;
  yearlyYield: number;
};

export default function CharitySelector({ openModal, yearlyYield }: Props) {
  const { data, error, isLoading } = useSWR(
    "/charity",
    getCurrentSelectedCharity
  );
  if (error) {
    console.error(error);
  }
  const selectedCharity = data && data[0].name;

  return (
    <div className="m-1 relative z-0 flex justify-center">
      <button
        className={`flex flex-col bg-white border-2 border-cyan-600 text-impact-fg rounded-[36px] h-[32px] mb-3 px-2 py-5 font-normal items-baseline`}
        onClick={() =>
          openModal(
            <CharitySelectorModal
              monthlyYield={yearlyYield / 12}
              selectedCharity={selectedCharity}
              updateSelectedCharity={updateSelectedCharity}
            />
          )
        }
      >
        <div className="flex w-full justify-center items-center space-y-2">
          <div className="flex items-center">
            <Image
              src={"/gear.svg"}
              width={16}
              height={16}
              alt="choose public good to fund"
            />
            <p className="ml-2 text-sm">
              {selectedCharity ? CHARITY_MAP[selectedCharity].name : "Charity"}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
