import axios from "axios";
import { useEffect, useState } from "react";

import { backendUrl } from "@/lib/utils";

type IRow = { first: string; second: string };

export function LeaderBoardTable(props: {
  title: string;
  headers: string[];
  rows: { td: string[] }[];
}) {
  const [value, setValue] = useState<IRow[]>([]);

  useEffect(() => {
    getCauseDelegate();
  }, []);

  const getCauseDelegate = async () => {
    try {
      const res = await axios.get(
        `https://app.glodollar.org/api/funding/current`
      );
      // const res = await axios.get(`${backendUrl}/api/funding/current`);
      const cause: IRow[] = [];
      const result = res.data["possibleFundingChoices"];
      for (const key in result) {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
          const element = result[key];
          cause.push({ first: key, second: element });
        }
      }
      setValue(cause);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="my-5">
      <h5 className=" font-semibold mb-2">{props.title}</h5>

      <div className="relative overflow-x-auto sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <THead data={props.headers} />
          <tbody>
            {value.map((val, i) => {
              // const [first, ...rest] = val.td;
              return <TRow key={i} head={val.first} others={[val.second]} />;
            })}
          </tbody>
          {/* <tbody>
            {props.rows.map((val, i) => {
              const [first, ...rest] = val.td;
              return <TRow key={i} head={first} others={rest} />;
            })}
          </tbody> */}
        </table>
      </div>
    </div>
  );
}

function TRow(props: { head: string; others: string[] }) {
  return (
    <tr className="odd:bg-white even:bg-gray-50 border-b dark:border-gray-300">
      <th
        scope="row"
        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
      >
        {props.head}
      </th>

      {props.others.map((val, i) => (
        <td key={i} className="px-6 py-4">
          {val}
        </td>
      ))}
    </tr>
  );
}

function THead(props: { data: string[] }) {
  return (
    <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
      <tr>
        {props.data.map((text, i) => (
          <th scope="col" className="px-6 py-3" key={i}>
            {text}
          </th>
        ))}
      </tr>
    </thead>
  );
}
