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
  const impactItemOffset = (yearlyImpactItems.length - 1) * 24;
  const [style, setStyle] = useState({
    transform: `translateY(-${impactItemOffset}px)`,
    opacity: "0",
    transition: "all 1s",
  });
  const { isConnected } = useAccount();
  useEffect(() => {
    if (isConnected) {
      const fadeinTimer = setTimeout(() => {
        setStyle({
          ...style,
          opacity: "1",
        });
      }, 500);
      const scrollTimer = setTimeout(() => {
        setStyle({
          ...style,
          opacity: "1",
          transform: "translateY(0px)",
        });
      }, 1800);

      return () => {
        setStyle({
          transform: `translateY(-${impactItemOffset}px)`,
          opacity: "0",
          transition: "all 1s",
        });
        clearTimeout(fadeinTimer);
        clearTimeout(scrollTimer);
      };
    }
  }, [isConnected]);

  const renderImpactItemList = (impactItemList: GetImpactItem[]) =>
    yearlyImpactItems.map((item, idx) => (
      <li key={`eb-idx${idx}`}>
        {item.emoji} &#10005; {item.count}
      </li>
    ));

  return (
    <div className="animated-impact-list">
      <ul style={style}>{renderImpactItemList(yearlyImpactItems)}</ul>
    </div>
  );
}
