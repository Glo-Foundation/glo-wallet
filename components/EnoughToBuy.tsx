import { motion, useAnimate } from "framer-motion";
import { useEffect } from "react";
import { useAccount } from "wagmi";

import { getImpactItems } from "@/utils";

type Props = {
  yearlyYield: number;
};
export default function EnoughToBuy({ yearlyYield }: Props) {
  const yearlyImpactItems = getImpactItems(yearlyYield);

  const impactItemOffset = (yearlyImpactItems.length - 1) * -24;
  const [scope, animate] = useAnimate();
  const { isConnected } = useAccount();
  useEffect(() => {
    if (isConnected) {
      const animation = async () => {
        await animate("ul", { opacity: 1 }, { duration: 1 });
        animate("ul", { y: "0px" }, { duration: 1.25, ease: "easeInOut" });
      };
      animation();
    }
  }, [isConnected]);

  const renderImpactItemList = () =>
    yearlyImpactItems.map((item, idx) => (
      <li key={`eb-idx${idx}`}>
        {item.emoji} &#10005; {item.count}
      </li>
    ));

  return (
    <div ref={scope} className="animated-impact-list">
      {isConnected && (
        <motion.ul initial={{ y: `${impactItemOffset}px`, opacity: "0" }}>
          {renderImpactItemList()}
        </motion.ul>
      )}
    </div>
  );
}
