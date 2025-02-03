import axios from "axios";
import useSWR from "swr";

import { backendUrl } from "@/lib/utils";

import { Table, TRow } from "./Table";

const formatDelegate = (payload: any) => {
  const cause: string[][] = [];
  const result = payload["possibleFundingChoices"];

  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const element = result[key].toString();
      const formattedKey = key.replace("_", " ");
      cause.push([formattedKey, "$".concat(element)]);
    }
  }

  return cause;
};

export function DelegateTable() {
  const fetcher = (url: string) =>
    axios.get(url).then((res) => {
      return formatDelegate(res.data);
    });

  const { data } = useSWR(`${backendUrl}/api/funding/current`, fetcher);

  if (!data) return <p>...</p>;
  return (
    <div className="my-5">
      <Table title={"Delegate and cause"} headers={["Cause", "Amount"]}>
        {data.map((val: string[], i) => {
          return <TRow key={i} td={val} />;
        })}
      </Table>
    </div>
  );
}
