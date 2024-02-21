import clsx from "clsx";
import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";

interface Props {
  selectedCharity: string;
}

interface CharityCardProps {
  name: string;
  description: string;
  type: string;
  iconPath: string;
  selected: boolean;
}

function CharityCard({
  name,
  description,
  type,
  iconPath,
  selected,
}: CharityCardProps) {
  return (
    <div
      className={clsx(
        "cursor-pointer flex flex-col justify-center border-2 rounded-xl border-pine-100 hover:border-pine-400 mb-2",
        selected && "bg-cyan-600/20"
      )}
      onClick={undefined}
    >
      <div className="flex flex-col justify-center">
        <div className="flex items-center p-3">
          <div className="min-w-[32px]">
            {selected ? (
              <div className="circle border-2 border-none bg-cyan-600 w-[32px] h-[32px]">
                <Image
                  alt="checkmark"
                  src="check-alpha.svg"
                  height={12}
                  width={12}
                />
              </div>
            ) : (
              <Image alt={iconPath} src={iconPath} height={32} width={32} />
            )}
          </div>
          <div className="pl-4">
            <div className="flex flex-row justify-between">
              <h5 className="text-sm mb-2">{name}</h5>
              <p className="copy text-xs">{type}</p>
            </div>
            <p className="copy text-xs">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CharitySelectorModal({ selectedCharity }: Props) {
  const { address } = useAccount();
  const { closeModal } = useContext(ModalContext);

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-2 pb-8">
      <div className="flex flex-row justify-between p-3">
        {/* fix hack */}
        <button />
        <Tooltip id="copy-deposit-tooltip" isOpen={isCopiedTooltipOpen} />
        <button
          className="copy cursor-pointer border-2 rounded-full border-cyan-200 px-3 py-1"
          data-tooltip-id="copy-deposit-tooltip"
          data-tooltip-content="Copied!"
          onClick={() => {
            navigator.clipboard.writeText(address!);
            setIsCopiedTooltipOpen(true);
          }}
        >
          🔗 {sliceAddress(address!)}
        </button>
        <button onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <section className="text-center">
        <h3 className="pt-0">Choose funding recipient</h3>
        <p className="text-sm py-4">
          You can decide where we donate the yield of the Glo Dollars you hold.
          Choose your favorite non-profit, public good or foundation below.
        </p>
      </section>
      <section>
        <CharityCard
          iconPath="/give-directly-logo.jpeg"
          name="GiveDirectly"
          description="Funds basic income programs for people in extreme poverty"
          type="default"
          selected={false}
        />
        <CharityCard
          iconPath="/one-tree-planted-logo.jpeg"
          name="One Tree Planted"
          description="Funds planting a forest together, one tree at a time"
          type="501(c)(3)"
          selected={false}
        />
        <CharityCard
          iconPath="/gitcoin-grants-logo.jpeg"
          name="Gitcoin Grants"
          description="Goes to a Quadratic Funding matching pool for Glo Consortium members"
          type="public good"
          selected={false}
        />
        <CharityCard
          iconPath="/optimism-logo.png"
          name="Optimism RetroPGF"
          description="Funds proportional matches to all recipients of Optimism's RetroPGF program"
          type="foundation"
          selected={false}
        />
      </section>

      <button className="secondary-button h-[52px] mx-2 mt-4">
        Click on a recipient to vote
      </button>
    </div>
  );
}
