import React from "react";

export default function THead(props: { data: string[] }) {
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
