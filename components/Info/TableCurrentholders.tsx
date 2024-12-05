import axios from "axios";
import useSWR from "swr";

import { backendUrl } from "@/lib/utils";

import { Table, TRow, splitAndAddEllipses } from "./Table";

const formatLeaderboardData = (payload: any) => {
  const typedArr = payload as {
    amount: number;
    blockchain: string;
    tx_from: string;
    tx_to: string;
  }[];

  const result = typedArr.map((val) => {
    return {
      tx_from: val.tx_from,
      amount: val.amount,
      blockchain: val.blockchain,
    };
  });

  const rows: string[][] = [];
  for (const row of result) {
    const dataCells = [];
    for (const key in row) {
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        const element = row[key].toString();
        dataCells.push(splitAndAddEllipses(element));
      }
    }
    rows.push(dataCells);
  }

  return rows;
};

export function LargestCurrentHolderTable() {
  const fetcher = (url: string) =>
    axios.get(url).then((res) => {
      return formatLeaderboardData(res.data);
    });

  const { data } = useSWR(`${backendUrl}/api/largest-current-holders`, fetcher);

  if (!data) return <p>...</p>;
  return (
    <div className="my-5">
      <Table
        title={"Largest current holders"}
        headers={["tx_from", "amount", "blockchain"]}
      >
        {data.map((val: string[], i) => {
          return <TRow key={i} td={val} />;
        })}
      </Table>
    </div>
  );
}
