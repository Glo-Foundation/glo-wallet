import axios from "axios";
import { useState } from "react";
import useSWR from "swr";

import { IBalance, INetworks } from "@/lib/bitQuery";
import { backendUrl } from "@/lib/utils";

import { Table, TRow, splitAndAddEllipses } from "./Table";

export function LargestCurrentHolderTable() {
  const [selectNetwork, setNetwork] = useState<INetworks>("eth");

  const fetcher = (url: string) =>
    axios.get(url).then((res) => {
      return res.data as IBalance[];
    });

  const { data } = useSWR(`${backendUrl}/api/largest-current-holders`, fetcher);

  return (
    <div className="my-5">
      <select
        onChange={(e) => {
          setNetwork(e.target.value as INetworks);
        }}
        className="w-full p-2"
      >
        <option value={"eth"}>Ethereum</option>
        <option value={"eth"}>Celo</option>
        <option value={"base"}>Base</option>
        <option value={"arbitrum"}>Arbitrum</option>
        <option value={"bsc"}>Bsc</option>
      </select>
      <Table title={"Largest current holders"} headers={["Holder", "Amount"]}>
        {data === undefined ? (
          <p>...</p>
        ) : (
          data.map((val, i) => {
            return (
              <TRow
                key={i}
                td={[
                  splitAndAddEllipses(val.BalanceUpdate.Address),
                  val.Balance.slice(0, 8),
                ]}
              />
            );
          })
        )}
      </Table>
    </div>
  );
}
