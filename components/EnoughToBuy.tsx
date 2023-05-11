import { useState } from "react";
import Image from "next/image";
import { getImpactItems, isLiftPersonOutOfPovertyImpactItem } from "@/utils";

type Props = {
  yearlyYield: number;
};

export default function EnoughToBuy({ yearlyYield }: Props) {
  const [flipped, setFlipped] = useState<boolean>(false);

  const yearlyImpactItem = getImpactItems(yearlyYield)[0];
  const enoughToLiftPersonOutOfPoverty =
    yearlyImpactItem && isLiftPersonOutOfPovertyImpactItem(yearlyImpactItem);

  return (
    <>
      {yearlyImpactItem.emoji} &#10005; {yearlyImpactItem.count}
    </>
  );
}
