import { Charity } from "@prisma/client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

import CharitySelectorModal from "@/components/Modals/CharitySelectorModal";
import { api, sliceAddress } from "@/lib/utils";

type Props = {
  openModal: (content: JSX.Element) => void;
  yearlyYield: number;
};

export default function CharitySelector({ openModal, yearlyYield }: Props) {
  const { address, isConnected, connector } = useAccount();
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const loggedIn = localStorage.getItem("loggedIn");

  useEffect(() => {
    console.log("loggedIn: ", loggedIn);
    if (loggedIn && isConnected && !selectedCharity) {
      getCurrentSelectedCharity();
    }
  }, [loggedIn, isConnected]);

  const getCurrentSelectedCharity = async (): void => {
    // console.log(selectedCharity);
    // console.log("api: ", await api());
    api()
      .get(`/charity`)
      .then((res) => {
        const currentSelectedCharity = res.data[0].name as Charity;
        setSelectedCharity(Charity[currentSelectedCharity]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="m-1 relative z-0 flex justify-center">
      <button
        className={`flex flex-col bg-white border-2 border-cyan-600 text-impact-fg rounded-[36px] h-[32px] mb-3 px-2 py-5 font-normal items-baseline`}
        onClick={() =>
          openModal(<CharitySelectorModal yearlyYield={yearlyYield / 12} />)
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
            <p className="ml-2 text-sm">{selectedCharity}</p>
          </div>
        </div>
      </button>
    </div>
  );
}
