import axios from "axios";
import { useState } from "react";
import useSWR from "swr";

import { ILargestMonthlyHolder } from "@/lib/dune";
import { backendUrl } from "@/lib/utils";

import { formatToCurrency } from "./data";
import { Table, TRow, splitAndAddEllipses } from "./Table";
import { INetworks, Networks } from "./types";

export function LargestMonthlyHolderTable() {
  const [selectNetwork, setNetwork] = useState<INetworks>("celo");

  const fetcher = (url: string) =>
    axios
      .get(url, {
        params: {
          network: selectNetwork,
        },
      })
      .then((res) => {
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
            className="w-full p-2 mb-1 outline-none border-none"
            onChange={(e) => {
              setNetwork(e.target.value as INetworks);
            }}
          >
            {Object.keys(Networks).map((val, i) => (
              <option key={i} value={val}>
                {Networks[val as INetworks]}
              </option>
            ))}
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
