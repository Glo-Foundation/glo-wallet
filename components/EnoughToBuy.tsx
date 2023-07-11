import { motion, useAnimate, stagger } from "framer-motion";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

import { getImpactItems, isLiftPersonOutOfPovertyImpactItem } from "@/utils";

import type { GetImpactItem } from "@/utils";

type Props = {
  yearlyYield: number;
};
export default function EnoughToBuy({ yearlyYield }: Props) {
  const yearlyImpactItems = getImpactItems(yearlyYield);
  const enoughToLiftPersonOutOfPoverty =
    yearlyImpactItems[0] &&
    isLiftPersonOutOfPovertyImpactItem(yearlyImpactItems[0]);
  const impactItemOffset = (yearlyImpactItems.length - 1) * -24;
  const [scope, animate] = useAnimate();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      const animation = async () => {
        await animate("ul", { opacity: 1 }, { duration: 1 });
        animate("ul", { y: "0px" }, { duration: 1.5, ease: "easeInOut" });
      };
      animation();
    }
  }, [isConnected]);

  const renderImpactItemList = (impactItemList: GetImpactItem[]) =>
    yearlyImpactItems.map((item, idx) => (
      <li key={`eb-idx${idx}`}>
        {item.emoji} &#10005; {item.count}
      </li>
    ));

  return (
    <div ref={scope} className="animated-impact-list">
      <motion.ul
        initial={{ y: `${impactItemOffset}px`, opacity: "0" }}
        style={{ y: `${impactItemOffset}px`, opacity: "0" }}
      >
        {renderImpactItemList(yearlyImpactItems)}
      </motion.ul>
    </div>
  );
}
