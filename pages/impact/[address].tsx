import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";

import DetailedEnoughToBuy from "@/components/DetailedEnoughToBuy";
import BuyGloModal from "@/components/Modals/BuyGloModal";
import UserAuthModal from "@/components/Modals/UserAuthModal";
import Navbar from "@/components/Navbar";
import { ModalContext } from "@/lib/context";
import { getAllowedChains, lastSliceAddress, sliceAddress } from "@/lib/utils";
import { getBalance, getTotalYield, getUSFormattedNumber } from "@/utils";

import { KVResponse } from "../api/transfers/first-glo/[address]";

export default function Impact() {
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  const { openModal } = useContext(ModalContext);
  const router = useRouter();
  const { push } = router;
  const { address } = router.query;

  const [formattedBalance, setFormattedBalance] = useState<string>("0");
  const [yearlyYield, setYearlyYield] = useState<number>(0);
  const [yearlyYieldFormatted, setYearlyYieldFormatted] =
    useState<string>("$0");
  const [whenFirstGlo, setWhenFirstGlo] = useState<string>("");

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);
  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) {
        return;
      }

      const chains = getAllowedChains();
      const bal1 = await getBalance(address as string, chains[0].id);
      const bal2 = await getBalance(address as string, chains[1].id);
      const decimals = BigInt(1000000000000000000);
      const balance = bal1.add(bal2).div(decimals).toNumber();

      let yearlyYield = getTotalYield(balance);
      // round down to 0 when the yield isn't even $1
      if (yearlyYield < 1) {
        yearlyYield = 0;
      }

      setYearlyYield(yearlyYield);
      const yearlyYieldFormatted =
        yearlyYield > 0 ? `$0 - $${yearlyYield.toFixed(0)}` : "$0";
      setYearlyYieldFormatted(yearlyYieldFormatted);
      setFormattedBalance(getUSFormattedNumber(balance));
    };
    fetchBalance();
  }, [address]);

  useEffect(() => {
    const seeWhenFirstGloTransaction = async () => {
      if (!address) {
        return;
      }

      const addressToCheck = address as string;
      const { data } = await axios.get<KVResponse>(
        `/api/transfers/first-glo/${addressToCheck}`
      );
      const { dateFirstGlo } = data;
      if (dateFirstGlo) {
        setWhenFirstGlo(beautifyDate(new Date(dateFirstGlo)));
      }
    };
    seeWhenFirstGloTransaction();
  }, [address]);

  const openUserAuthModal = () => {
    openModal(<UserAuthModal />, "bg-transparent");
    push("/");
  };

  return (
    <>
      <Head>
        <title>Glo Impact</title>
      </Head>
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
                  <span>{whenFirstGlo}</span>
                </div>
              </div>
            </div>
            <div className="text-normal pb-4">Owns</div>
            <div className="flex flex-row font-extrabold justify-start">
              <div className="flex flex-row text-[2.625rem] items-baseline">
                <span
                  className="font-extrabold"
                  data-testid="formatted-balance"
                >
                  ${formattedBalance}{" "}
                </span>
                <span className="text-sm ml-1">Glo Dollar</span>
              </div>
            </div>
          </div>
          <div
            className="flex flex-col bg-impact-bg text-impact-fg rounded-[24px] mx-1 mb-1 px-4 pb-3 cursor-pointer"
            onClick={() => openModal(<BuyGloModal />)}
            data-testid="simulateBuyGlo"
          >
            <div className="overflow-hidden">
              <div className="h-4 w-4 bg-white -rotate-45 transform origin-top-left translate-x-32"></div>
            </div>
            <div className="flex flex-col w-full justify-between items-start space-y-2">
              <span className="my-2">Creating basic income of</span>
              <div
                className="text-[2.625rem] leading-[2.625rem] break-all font-neuehaasgrotesk"
                data-testid="yearlyYieldFormatted"
              >
                {yearlyYieldFormatted}
                <span className="text-base">/ year</span>
              </div>
              <span className="text-xs text-[11px] py-4">
                Current impact on the lower end of this range because Glo Dollar{" "}
                <a
                  className="underline"
                  href="https://www.glodollar.org/articles/from-bootstrap-to-high-impact"
                  target="_blank"
                  rel="noreferrer"
                >
                  is bootstrapping
                </a>
                . Adoption helps grow impact.
              </span>
            </div>
          </div>
          <DetailedEnoughToBuy
            yearlyYield={yearlyYield}
            noImpactCopyText="Nothing."
          />
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

const beautifyDate = (date?: Date) => {
  if (!date) {
    return "";
  }

  const year = date.getFullYear().toString().slice(2);
  const month = date.toLocaleString("default", { month: "long" }).toLowerCase();

  return ` 🔆 ${month.toString().toLowerCase()} ‘${year}`;
};
