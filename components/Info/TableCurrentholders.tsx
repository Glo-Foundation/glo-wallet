import axios from "axios";
import { useState } from "react";
import useSWR from "swr";

import { ILargestHolder } from "@/lib/dune";
import { backendUrl } from "@/lib/utils";

import { formatToCurrency } from "./data";
import { Table, TRow, splitAndAddEllipses } from "./Table";
import { INetworks } from "./types";

export function LargestCurrentHolderTable() {
  const [selectNetwork, setNetwork] = useState<INetworks>("eth");

  const fetcher = (url: string) =>
    axios.get(url).then((res) => {
      return res.data as ILargestHolder[];
    });

  const { data } = useSWR(`${backendUrl}/api/largest-current-holders`, fetcher);

  return (
    <div className="my-5">
      <Table
        title={"Largest current holders"}
        headers={["Holder", "Amount"]}
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
        {data === undefined ? (
          <p>...</p>
        ) : (
          data.map((val, i) => {
            return (
              <TRow
                key={i}
                td={[
                  splitAndAddEllipses(val.tx_from),
                  formatToCurrency(val.token_a_value_held).slice(0, 9),
                ]}
              />
            );
          })
        )}
      </Table>
    </div>
  );
}
