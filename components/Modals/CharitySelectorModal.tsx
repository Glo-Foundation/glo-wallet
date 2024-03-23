import { Charity } from "@prisma/client";
import { getWalletClient, SignMessageResult } from "@wagmi/core";
import clsx from "clsx";
import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import useSWR from "swr";
import { Hex } from "viem/types/misc";
import { useAccount } from "wagmi";

import { getCurrentSelectedCharity } from "@/fetchers";
import { ModalContext } from "@/lib/context";
import { api, sliceAddress } from "@/lib/utils";
import { CHARITY_MAP } from "@/lib/utils";
import { UpdateCharityChoiceBody } from "@/pages/api/charity";

interface Props {
  monthlyYield: number;
}

interface CharityCardProps {
  name: string;
  description: string;
  type: string;
  iconPath: string;
  selected: boolean;
  selectCharity: (name: string) => void;
}

function CharityCard({
  name,
  description,
  type,
  iconPath,
  selected,
  selectCharity,
}: CharityCardProps) {
  return (
    <div
      className={clsx(
        "cursor-pointer flex flex-col justify-center border-2 rounded-xl border-pine-100 hover:border-pine-400 mb-2",
        selected && "bg-cyan-600/20"
      )}
      onClick={() => selectCharity(name)}
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
              <Image
                alt={iconPath}
                src={iconPath}
                height={32}
                width={32}
                className="rounded-2xl"
              />
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

export default function CharitySelectorModal({ monthlyYield }: Props) {
  const { address } = useAccount();
  const { closeModal } = useContext(ModalContext);
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  const [locallySelectedCharity, setLocallySelectedCharity] =
    useState<Charity | null>(null);

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const { data, error, mutate } = useSWR("/charity", getCurrentSelectedCharity);
  if (error) {
    console.error(error);
  }
  const selectedCharity = data && data[0].name;

  const signCharityUpdateMessage = async (
    message: string
  ): Promise<SignMessageResult | undefined> => {
    const walletClient = await getWalletClient();
    const sig = await walletClient?.signMessage({
      message: message,
    } as any);
    return sig;
  };

  const updateSelectedCharity = async (charity: Charity) => {
    // backend has to verify the signature and also make sure the timestamp is after the last choice and before the current time
    const currentDateTimeString = new Date().toISOString();
    const signingBody = {
      timestamp: currentDateTimeString,
      charity: charity,
      action: "Updating charity selection",
    };

    const signingBodyString = JSON.stringify(signingBody);
    const signature = await signCharityUpdateMessage(signingBodyString);

    const apiBody: UpdateCharityChoiceBody = {
      sigFields: {
        timestamp: currentDateTimeString,
        charity: charity,
        action: "Updating charity selection",
        sig: signature as Hex,
      },
      choices: [{ charity: charity, percent: 100 }],
    };

    api()
      .post(`/charity`, apiBody)
      .then(() => mutate());
  };

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-2 pb-8">
      <div className="flex flex-row justify-between p-3">
        {/* fix hack */}
        <div />
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
        <p className="text-sm py-4 copy">
          You can decide where we donate our revenue. Choose your favorite
          charitable cause below.
        </p>
      </section>
      <section className="flex flex-row mb-3 space-x-2 items-center justify-center">
        <Image
          alt="glo-logo-small"
          src="/glo-logo-small.png"
          height={20}
          width={20}
        />
        <p className="text-sm font-bold">
          donate up to ~${monthlyYield} this month to
        </p>
      </section>
      <section>
        {Object.entries(CHARITY_MAP).map(([key, charity]) => {
          return (
            <CharityCard
              key={key}
              iconPath={charity.iconPath}
              name={charity.name}
              description={charity.description}
              type={charity.type}
              selected={
                locallySelectedCharity
                  ? locallySelectedCharity === key
                  : selectedCharity === key
              }
              selectCharity={() =>
                setLocallySelectedCharity(Charity[key as keyof typeof Charity])
              }
            />
          );
        })}
      </section>

      <button
        className="secondary-button h-[52px] mx-2 mt-4"
        disabled={
          !locallySelectedCharity || locallySelectedCharity === selectedCharity
        }
        onClick={() => updateSelectedCharity(locallySelectedCharity as Charity)}
      >
        Click on a recipient to vote
      </button>
    </div>
  );
}
