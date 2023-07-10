import { loadAnimation } from "lottie-web";
import Image from "next/image";
import { useState, useEffect } from "react";

import BuyGloModal from "@/components/Modals/BuyGloModal";

import EnoughToBuy from "./EnoughToBuy";

type Props = {
  openModal: any;
  yearlyYield: number;
  yearlyYieldFormatted: string;
};
export default function ImpactInset({
  openModal,
  yearlyYield,
  yearlyYieldFormatted,
}: Props) {
  const [style, setStyle] = useState({
    opacity: "0",
    transition: "all 1s",
  });
  useEffect(() => {
    const fadeinTimer = setTimeout(() => {
      setStyle({
        ...style,
        opacity: "1",
      });
      const logoContainer = document.getElementById("spinny-logo");
      loadAnimation({
        container: logoContainer,
        renderer: "html",
        loop: true,
        autoplay: true,
        path: "/Glo_Logo Animation_LightGrey_Symbol.mp4.lottie.json",
      });
    }, 500);
  }, []);
  return (
    <div className="m-1">
      <button
        className="flex flex-col bg-impact-bg text-impact-fg rounded-[24px] px-5 pb-3 w-full font-normal items-baseline"
        onClick={() => openModal(<BuyGloModal />)}
      >
        <div className="">
          <div className="h-4 w-4 bg-white -rotate-45 transform origin-top-left translate-x-32"></div>
        </div>
        <div className="flex w-full justify-between items-center space-y-2">
          <div className="flex items-center" style={style}>
            <div id="spinny-logo" className="h-[28px] w-[28-px]" />
            {/* <Image */}
            {/*   className="pb-[2px] mr-2" */}
            {/*   src="/glo-logo.svg" */}
            {/*   alt="glo" */}
            {/*   height={28} */}
            {/*   width={28} */}
            {/* /> */}
            {yearlyYieldFormatted} / year
          </div>
          <EnoughToBuy yearlyYield={yearlyYield} />
        </div>
      </button>
    </div>
  );
}
