import { Charity } from "@prisma/client";
import { getWalletClient, SignMessageResult, Chain } from "@wagmi/core";
import Image from "next/image";
import Slider from "rc-slider";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { Hex } from "viem/types/misc";
import { useNetwork } from "wagmi";

import { getCurrentSelectedCharity } from "@/fetchers";
import { ModalContext } from "@/lib/context";
import { useToastStore } from "@/lib/store";
import { api, CHARITY_MAP } from "@/lib/utils";
import { UpdateCharityChoiceBody } from "@/pages/api/charity";

interface Props {
  yearlyYield: number;
  percentMap: { [id: string]: number };
  isAddNewMode?: boolean;
  onClose?: () => void;
}

interface CharityCardProps {
  name: string;
  percent: number;
  yearlyYield: number;
  iconPath: string;
  setPercent: (value: number) => void;
  onDelete?: () => void;
}

const CharitySlider = ({
  name,
  percent,
  yearlyYield,
  iconPath,
  setPercent,
  onDelete,
}: CharityCardProps) => (
  <div className="flex flex-col justify-center border-t-2 border-pine-100">
    <div className="flex flex-col justify-center">
      <div className="flex items-center p-2">
        <div className="min-w-[32px]">
          <Image
            alt={iconPath}
            src={iconPath}
            height={32}
            width={32}
            className="rounded-2xl"
          />
        </div>
        <div className="pl-4">
          <div className="flex justify-between">
            <h5 className="text-sm">{name}</h5>
          </div>
        </div>
        {onDelete && (
          <Image
            className="ml-auto cursor-pointer"
            alt="trash"
            src="trash.svg"
            height={16}
            width={16}
            onClick={() => onDelete()}
          />
        )}
      </div>
    </div>
    <div className="px-5 py-2 mb-8">
      <Slider
        min={0}
        max={100}
        step={1}
        onChange={(x) => setPercent(Array.isArray(x) ? x[0] : x)}
        defaultValue={percent}
        value={percent}
        railStyle={{
          backgroundColor: "#EAF2F1",
        }}
        trackStyle={{
          backgroundColor: "rgb(36 229 223)",
        }}
        handleStyle={{
          height: "28px",
          width: "28px",
          backgroundColor: "white",
          border: "8px solid rgb(36 229 223)",
          opacity: 1,
          marginTop: "-13px",
        }}
        marks={{
          [percent]: (
            <>
              <h5 className="text-sm mt-[2px]">{percent}%</h5>
              <p className="mt-[-10px]">
                (~{((percent / 100) * yearlyYield).toFixed(2)}$)
              </p>
            </>
          ),
        }}
      />
    </div>
  </div>
);

export default function CharityManageModal(props: Props) {
  const { closeModal } = useContext(ModalContext);

  const { chain } = useNetwork();
  const [percentMap, setPercentMap] = useState({ ...props.percentMap });
  useEffect(() => {
    if (props.isAddNewMode) {
      const count = Object.keys(props.percentMap).length;
      const equal = Math.floor(100 / count);
      const last = equal + (100 - equal * count);
      const updated: { [id: string]: number } = {};

      Object.entries(percentMap).forEach(([key], index) => {
        updated[key] = index < count - 1 ? equal : last;
      });
      setPercentMap({ ...updated });
    }
  }, []);

  const { setShowToast } = useToastStore();
  const selectedKeys = Object.keys(percentMap);
  const charities = Object.entries(CHARITY_MAP).filter((x) =>
    selectedKeys.includes(x[0])
  );

  const sumPercentages = Object.values(percentMap).reduce(
    (acc, cur) => acc + cur,
    0
  );
  const { mutate } = useSWR("/charity", getCurrentSelectedCharity);

  const onClose = () => {
    if (props.onClose) props.onClose();
  };

  const signCharityUpdateMessage = async (
    message: string
  ): Promise<SignMessageResult | undefined> => {
    const walletClient = await getWalletClient();
    const sig = await walletClient?.signMessage({
      message: message,
    } as any);
    return sig;
  };

  const updateSelectedCharity = async (
    percentMap: { [key: string]: number },
    chain: Chain
  ) => {
    // backend has to verify the signature and also make sure the timestamp is after the last choice and before the current time
    const currentDateTimeString = new Date().toISOString();
    const charities = Object.entries(percentMap).map((x) => ({
      charity: x[0] as Charity,
      percent: x[1],
    }));

    const nonZeroCharities = charities.filter((x) => x.percent > 0);
    const signingBody = {
      timestamp: currentDateTimeString,
      charities: nonZeroCharities,
      action: "Updating charity selection",
    };

    const signingBodyString = JSON.stringify(signingBody);
    const signature = await signCharityUpdateMessage(signingBodyString);

    const apiBody: UpdateCharityChoiceBody = {
      sigFields: {
        timestamp: currentDateTimeString,
        charities: nonZeroCharities,
        action: "Updating charity selection",
        sig: signature as Hex,
      },
      choices: nonZeroCharities,
      chain: chain,
    };

    api()
      .post(`/charity`, apiBody)
      .then(() => mutate())
      .then(() => closeModal())
      .then(() =>
        setShowToast({
          showToast: true,
          message: "Distribution updated",
        })
      );
  };

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-2">
      <div className="flex flex-row justify-end p-2">
        <button
          onClick={() => {
            closeModal();
            onClose();
          }}
        >
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <section className="text-center">
        <h3 className="pt-0">
          {props.isAddNewMode
            ? "Confirm how to split recipients"
            : "Manage recipients"}
        </h3>
        <p className="text-sm py-4 copy">
          You can decide how much we should donate to each recipient.
        </p>
      </section>
      <section>
        {charities.map(([key, charity]) => (
          <CharitySlider
            key={key}
            iconPath={charity.iconPath}
            name={charity.name}
            percent={percentMap[key]}
            yearlyYield={props.yearlyYield}
            setPercent={(value: number) => {
              percentMap[key] = value;
              setPercentMap({ ...percentMap });
            }}
            onDelete={
              charities.length > 1
                ? () => {
                    delete percentMap[key];
                    setPercentMap({ ...percentMap });
                  }
                : undefined
            }
          />
        ))}
      </section>

      <button
        className={"primary-button m-2"}
        onClick={() => {
          updateSelectedCharity(percentMap, chain as Chain);
          onClose();
        }}
        disabled={sumPercentages != 100}
      >
        {sumPercentages != 100
          ? `Please add ${100 - sumPercentages}%`
          : props.isAddNewMode
          ? "Confirm"
          : "Save"}
      </button>
    </div>
  );
}
