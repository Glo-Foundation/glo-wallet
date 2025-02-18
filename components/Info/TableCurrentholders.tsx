import axios from "axios";
import { useState } from "react";
import useSWR from "swr";

import { ILargestHolder } from "@/lib/dune";

import { formatToCurrency } from "./data";
import { splitAndAddEllipses, Table, TRow } from "./Table";
import { INetworks, Networks } from "./types";

export function LargestCurrentHolderTable() {
  const [selectNetwork, setNetwork] = useState<INetworks>("celo");

  const fetcher = (url: string) =>
    axios
      .get(url, {
        params: {
          network: selectNetwork,
        },
      })
      .then((res) => {
        return res.data as ILargestHolder[];
      });

  const { data } = useSWR(`/api/largest-current-holders`, fetcher);

  return (
    <div className="my-5">
      <Table
        title={"Largest current holders"}
        headers={["Holder", "Amount"]}
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
        {data === undefined ? (
          <p>...</p>
        ) : (
          data.map((val, i) => {
            return (
              <TRow
                key={i}
                td={[
                  splitAndAddEllipses(val.tx_from),
                  formatToCurrency(val.token_a_value_held).slice(0, 12),
                ]}
              />
            );
          })
        )}
      </Table>
    </div>
  );
}
