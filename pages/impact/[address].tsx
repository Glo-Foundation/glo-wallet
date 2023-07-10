import { getNetwork } from "@wagmi/core";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";

import DetailedEnoughToBuy from "@/components/DetailedEnoughToBuy";
import BuyGloModal from "@/components/Modals/BuyGloModal";
import UserAuthModal from "@/components/Modals/UserAuthModal";
import Navbar from "@/components/Navbar";
import { ModalContext } from "@/lib/context";
import { lastSliceAddress, sliceAddress } from "@/lib/utils";
import { getBalance, getTotalYield, getUSFormattedNumber } from "@/utils";

type Props = {
  balance: number;
};

export default function Impact({ balance }: Props) {
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  const { openModal } = useContext(ModalContext);
  const router = useRouter();
  const { address } = router.query;

  const yearlyYield = getTotalYield(balance);
  const yearlyYieldFormatted =
    yearlyYield > 0 ? `$0 - $${yearlyYield.toFixed(0)}` : "$0";
  const formattedBalance = getUSFormattedNumber(balance);

  const { push } = useRouter();

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const openUserAuthModal = () => {
    openModal(<UserAuthModal />, "bg-transparent");
    push("/");
  };

  return (
    <>
      <Navbar />
      <div className="mt-4 px-6">
        <div className="bg-white rounded-[20px] py-4">
          <div className="flex flex-col space-y-2 px-4 mb-4">
            <div className="flex flex-row font-semibold justify-start mb-4 hover:cursor-pointer">
              <Tooltip
                anchorId="copy-wallet-address"
                content="Copied!"
                noArrow={true}
                isOpen={isCopiedTooltipOpen}
                className="ml-16"
              />
              <div
                id="copy-wallet-address"
                className="flex text-xs items-center justify-start"
                onClick={() => {
                  navigator.clipboard.writeText(address as string);
                  setIsCopiedTooltipOpen(true);
                }}
              >
                <button className="primary-button w-16 h-16 p-2 text-sm text-pine-900/90 mr-4">
                  {address && lastSliceAddress(address)}
                </button>
                <div className="flex flex-col text-[14px] font-normal leading-normal text-pine-900/90">
                  <span>{sliceAddress(address as string, 4)}</span>
                  <span className=""> 🔆 july ‘23</span>
                </div>
              </div>
            </div>
            <div className="text-normal pb-4">Owns</div>
            <div className="flex flex-row font-extrabold justify-start">
              <div className="flex flex-row text-[2.625rem] items-baseline">
                <span className="font-extrabold">${formattedBalance} </span>
                <span className="text-sm ml-1">Glo Dollar</span>
              </div>
            </div>
          </div>
          <div
            className="flex flex-col bg-impact-bg text-impact-fg rounded-[24px] mx-1 mb-1 px-4 pb-3 cursor-pointer"
            onClick={() => openModal(<BuyGloModal />)}
          >
            <div className="overflow-hidden">
              <div className="h-4 w-4 bg-white -rotate-45 transform origin-top-left translate-x-32"></div>
            </div>
            <div className="flex flex-col w-full justify-between items-start space-y-2">
              <span className="my-2">Creating basic income of</span>
              <div className="text-[2.625rem] leading-[2.625rem] break-all font-neuehaasgrotesk">
                {yearlyYieldFormatted}
                <span className="text-base">/ year</span>
              </div>
              <span className="text-xs text-[11px] py-4">
                Current impact on the lower end of this range because Glo Dollar
                is bootstrapping. Adoption helps grow impact.
              </span>
            </div>
          </div>
          <DetailedEnoughToBuy yearlyYield={yearlyYield} glo={yearlyYield} />
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="font-normal leading-normal mt-3 mb-2">
            Help end extreme poverty
          </div>
          <button
            className="primary-button px-6"
            onClick={() => openUserAuthModal()}
          >
            Buy Glo Dollar
          </button>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({
  params,
}: GetServerSidePropsContext) {
  const { chain } = getNetwork();
  const address = params?.address;
  const balance = await getBalance(address as string, chain?.id);
  const decimals = BigInt(1000000000000000000);
  const formattedBalance = balance.div(decimals).toNumber();
  return {
    props: {
      balance: formattedBalance,
    },
  };
}
