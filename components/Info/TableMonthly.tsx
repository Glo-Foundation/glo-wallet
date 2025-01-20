import axios from "axios";
import { useState } from "react";
import useSWR from "swr";

import { ILargestMonthlyHolder } from "@/lib/dune";
import { backendUrl } from "@/lib/utils";

import { formatToCurrency } from "./data";
import { Table, TRow, splitAndAddEllipses } from "./Table";
import { INetworks } from "./types";

export function LargestMonthlyHolderTable() {
  const [selectNetwork, setNetwork] = useState<INetworks>("eth");
  const fetcher = (url: string) =>
    axios.get(url).then((res) => {
      return res.data as ILargestMonthlyHolder[];
    });

  const { data } = useSWR(`${backendUrl}/api/largest-monthly-holders`, fetcher);

  if (!data) return <p>...</p>;

  console.log(data);
  return (
    <div className="my-5">
      <Table
        title={"Largest holders in the last month"}
        headers={["Holder", "Avg. amount"]}
        others={
          <select
            onChange={(e) => {
              setNetwork(e.target.value as INetworks);
            }}
            className="w-full p-2 mb-3"
          >
            <option value={"eth"}>Ethereum</option>
            <option value={"eth"}>Celo</option>
            <option value={"base"}>Base</option>
            <option value={"arbitrum"}>Arbitrum</option>
            <option value={"bsc"}>Bsc</option>
          </select>
        }
      >
        {data.map((val, i) => {
          return (
            <TRow
              key={i}
              td={[
                splitAndAddEllipses(val.tx_from),
                formatToCurrency(val.avg_monthly_balance).slice(0, 9),
              ]}
            />
          );
        })}
      </Table>
    </div>
  );
}
