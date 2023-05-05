export const getTotalYield = (
  yearlyInterestRate: number,
  amount: number,
  totalDays: number
): number => {
  return (amount * yearlyInterestRate * totalDays) / 365;
};

export interface GetImpactItem {
  description: string;
  cost: number;
  count: number;
  emoji: string;
}
export const getImpactItems = (amount: number): GetImpactItem[] => {
  // descending order of cost
  const possibleImpactItems = [
    {
      description: "20 litres of water",
      cost: 0.03,
      emoji: "🚰",
    },
    {
      description: "kg of maize",
      cost: 0.95,
      emoji: "🌽",
    },
    {
      description: "School textbook",
      cost: 1.22,
      emoji: "📚",
    },
    {
      description: "School uniform",
      cost: 3.24,
      emoji: "🧑‍🏫",
    },
    {
      description: "Kienyeji farm chicken",
      cost: 12,
      emoji: "🐔",
    },
    {
      description: "Fishing net",
      cost: 100,
      emoji: "🎣",
    },
    {
      description: "Saanen dairy goat",
      cost: 121,
      emoji: "🐐",
    },
    {
      description: "Inventory to start a kiosk",
      cost: 162,
      emoji: "🏪",
    },
    {
      description: "Dairy cow",
      cost: 200,
      emoji: "🐄",
    },
    {
      description: "House building materials",
      cost: 227,
      emoji: "🧱",
    },
    {
      description: "80 m² of farm land",
      cost: 300,
      emoji: "🌱",
    },
    {
      description: "Person out of extreme poverty",
      cost: 480,
      emoji: "🧑",
    },
  ].sort((item1, item2) => item2.cost - item1.cost);

  let impactItems = [];
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
