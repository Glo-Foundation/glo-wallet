import React from "react";

export default function TRow(props: { head: string; others: string[] }) {
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
