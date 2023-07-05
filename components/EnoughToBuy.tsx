import {
  getImpactItems,
  getImpactItemList,
  isLiftPersonOutOfPovertyImpactItem,
} from "@/utils";

type Props = {
  yearlyYield: number;
};
export default function EnoughToBuy({ yearlyYield }: Props) {
  const impactItem = getImpactItemList();
  const yearlyImpactItem = getImpactItems(yearlyYield)[0];
  const enoughToLiftPersonOutOfPoverty =
    yearlyImpactItem && isLiftPersonOutOfPovertyImpactItem(yearlyImpactItem);

  return (
    <>
      {yearlyImpactItem?.emoji} &#10005; {yearlyImpactItem?.count}
    </>
  );
}
