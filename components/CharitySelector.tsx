import CharitySelectorModal from "@/components/Modals/CharitySelectorModal";

type Props = {
  openModal: (content: JSX.Element) => void;
  selectedCharity: string;
  yearlyYield: number;
};

export default function CharitySelector({
  openModal,
  selectedCharity,
  yearlyYield,
}: Props) {
  return (
    <div className="m-1 relative z-0 flex justify-center">
      <button
        className={`flex flex-col border-2 border-impact-bg text-impact-fg rounded-[36px] h-[32px] mb-3 px-5 py-7 w-[95%] font-normal items-baseline`}
        onClick={() =>
          openModal(
            <CharitySelectorModal
              selectedCharity={selectedCharity}
              yearlyYield={yearlyYield}
            />
          )
        }
      >
        {selectedCharity}
      </button>
    </div>
  );
}
