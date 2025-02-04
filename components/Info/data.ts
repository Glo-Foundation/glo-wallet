import { ICard } from "./types";

export function formatToCurrency(num: number) {
  if (isNaN(num)) {
    return "...";
  }
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const totalSupplyFormatter = (res: string) => {
  const dividedByAMillion = (parseInt(res) / 1_000_000).toFixed(2).toString();
  const withDollarSign = "$".concat(dividedByAMillion.toString()).concat("M");

  return withDollarSign;
};

const formatNumber = (payload: string) => {
  return parseInt(payload)
    .toLocaleString("en-US", {
      minimumFractionDigits: 0,
    })
    .toString();
};
export const infoCards: ICard[] = [
  {
    title: "Glo Dollars in circulation today",
    image: "/info/world.png",
    name: "TOTAL_SUPPLY",
    formatResult: totalSupplyFormatter,
    url: "/api/total-supply",
  },
  {
    title: "Glo Dollar holders",
    image: "/info/shecode.png",
    name: "DOLLAR_HOLDERS",
    url: "/api/total-holders",
    formatResult: formatNumber,
  },
  {
    title: "Glo Dollar transactions",
    image: "/info/calculator.png",
    name: "TOTAL_TRANSACTIONS",
    url: "/api/total-transactions",
    formatResult: formatNumber,
  },
  {
    title: "Organizations integrating Glo",
    image: "/info/handshake.png",
    name: "ORG_INTEGRATED",
    url: "",
    count: "61",
  },
  {
    title: "Donated",
    image: "/info/receipt.png",
    name: "DONATED",
    url: "",
    count: "$11,252",
  },
];
