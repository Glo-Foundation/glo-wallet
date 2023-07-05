import { getImpactItems, isLiftPersonOutOfPovertyImpactItem } from "@/utils";

type Props = {
  yearlyYield: number;
};
export default function EnoughToBuy({ yearlyYield }: Props) {
  const yearlyImpactItems = getImpactItems(yearlyYield);
  const enoughToLiftPersonOutOfPoverty =
    yearlyImpactItems[0] &&
    isLiftPersonOutOfPovertyImpactItem(yearlyImpactItems[0]);

  const renderImpactItemList = (impactItemList) =>
    yearlyImpactItems.map((item, idx) => (
      <li key={`eb-idx${idx}`}>
        {item.emoji} &#10005; {item.count}
      </li>
    ));

  return <ul>{renderImpactItemList(yearlyImpactItems)}</ul>;
}
