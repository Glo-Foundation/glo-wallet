import axios from "axios";
import useSWR from "swr";

import { backendUrl } from "@/lib/utils";

import { Table, TRow, splitAndAddEllipses } from "./Table";

type KeysType = "date" | "amount" | "blockchain" | "tx_from";

const formatLeaderboard = (payload: any) => {
  const rows: string[][] = [];
  const typedArr = payload as {
    amount: number;
    block_date: string;
    block_month: string;
    blockchain: string;
    tx_from: string;
    tx_to: string;
  }[];

  const result = typedArr.map((val) => {
    return {
      date: val.block_date,
      blockchain: val.blockchain,
      amount: val.amount,
      tx_from: val.tx_from,
    };
  });

  for (const row of result) {
    const dataCells = [];
    for (const key in row) {
      const typedKey = key as KeysType;
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        const element = row[typedKey].toString();
        dataCells.push(splitAndAddEllipses(element));
      }
    }
    rows.push(dataCells);
  }

  return rows;
};

export function LargestMonthlyHolderTable() {
  const fetcher = (url: string) =>
    axios.get(url).then((res) => {
      return formatLeaderboard(res.data);
    });

  const { data } = useSWR(`${backendUrl}/api/largest-monthly-holders`, fetcher);

  if (!data) return <p>...</p>;
  return (
    <div className="my-5">
      <Table
        title={"Largest holders in the last month"}
        headers={["block_date", "blockchain", "amount", "tx_from"]}
      >
        {data.map((val: string[], i) => {
          return <TRow key={i} td={val} />;
        })}
      </Table>
    </div>
  );
}
