import { useState, useEffect } from "react";

import { getImpactItems, isLiftPersonOutOfPovertyImpactItem } from "@/utils";

type Props = {
  yearlyYield: number;
};
export default function EnoughToBuy({ yearlyYield }: Props) {
  const yearlyImpactItems = getImpactItems(yearlyYield);
  const enoughToLiftPersonOutOfPoverty =
    yearlyImpactItems[0] &&
    isLiftPersonOutOfPovertyImpactItem(yearlyImpactItems[0]);
  const [fadein, setFadein] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [style, setStyle] = useState({
    transform: `translateY(-${(yearlyImpactItems.length - 1) * 24}px)`,
    opacity: "0",
    transition: "all 1s",
  });
  useEffect(() => {
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
      clearTimeout(fadeinTimer);
      clearTimeout(scrollTimer);
    };
  }, []);

  const renderImpactItemList = (impactItemList) =>
    yearlyImpactItems.map((item, idx) => (
      <li key={`eb-idx${idx}`}>
        {item.emoji} &#10005; {item.count}
      </li>
    ));

  return (
    <div className="animated-impact-list">
      <ul className="opaque descroll" style={style}>
        {renderImpactItemList(yearlyImpactItems)}
      </ul>
    </div>
  );
}
