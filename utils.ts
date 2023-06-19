const TOTAL_DAYS = 365;
const ANNUAL_INTEREST_RATE = 0.024;

export const getTotalYield = (amount: number): number => {
  return (amount * ANNUAL_INTEREST_RATE * TOTAL_DAYS) / 365;
};

export interface GetImpactItem {
  description: string;
  cost: number;
  count: number;
  emoji: string;
}
export const getImpactItems = (amount: number): GetImpactItem[] => {
  // descending order of cost
  // multiplying every item by 1.11 because givedirectly is only 90% efficient with the yield received
  const possibleImpactItems = [
    {
      description: "20 litres of water",
      cost: 0.03 * 1.11,
      emoji: "🚰",
    },
    {
      description: "kg of maize",
      cost: 0.95 * 1.11,
      emoji: "🌽",
    },
    {
      description: "School textbook",
      cost: 1.22 * 1.11,
      emoji: "📚",
    },
    {
      description: "School uniform",
      cost: 3.24 * 1.11,
      emoji: "🧑‍🏫",
    },
    {
      description: "Kienyeji farm chicken",
      cost: 12 * 1.11,
      emoji: "🐔",
    },
    {
      description: "Fishing net",
      cost: 100 * 1.11,
      emoji: "🎣",
    },
    {
      description: "Saanen dairy goat",
      cost: 121 * 1.11,
      emoji: "🐐",
    },
    {
      description: "Inventory to start a kiosk",
      cost: 162 * 1.11,
      emoji: "🏪",
    },
    {
      description: "Dairy cow",
      cost: 200 * 1.11,
      emoji: "🐄",
    },
    {
      description: "House building materials",
      cost: 227 * 1.11,
      emoji: "🧱",
    },
    {
      description: "80 m² of farm land",
      cost: 300 * 1.11,
      emoji: "🌱",
    },
    {
      description: "Person out of extreme poverty",
      // 480 already takes into account givedirectly inefficiency figure
      cost: 480,
      emoji: "🧑",
    },
  ].sort((item1, item2) => item2.cost - item1.cost);

  const impactItems = [];
  for (let idx = 0; amount > 0 && idx < possibleImpactItems.length; idx++) {
    const possibleImpactItem = possibleImpactItems[idx];
    if (amount >= possibleImpactItem.cost) {
      const itemCount = Math.floor(amount / possibleImpactItem.cost);
      impactItems.push({ ...possibleImpactItem, count: itemCount });
    }
  }
  return impactItems;
};

export const isLiftPersonOutOfPovertyImpactItem = (
  impactItem: GetImpactItem
): boolean => {
  return impactItem.description === "Person out of extreme poverty";
};

export const getUSFormattedNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};
