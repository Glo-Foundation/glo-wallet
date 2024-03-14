import Image from "next/image";

import CharitySelectorModal from "@/components/Modals/CharitySelectorModal";

type Props = {
  openModal: (content: JSX.Element) => void;
  yearlyYield: number;
};

export default function CharitySelector({ openModal, yearlyYield }: Props) {
  return (
    <div className="m-1 relative z-0 flex justify-center">
      <button
        className={`flex flex-col bg-white border-2 border-cyan-600 text-impact-fg rounded-[36px] h-[32px] mb-3 px-2 py-5 font-normal items-baseline`}
        onClick={() =>
          openModal(<CharitySelectorModal yearlyYield={yearlyYield} />)
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
            <p className="ml-2 text-sm">Charity</p>
          </div>
        </div>
      </button>
    </div>
  );
}
