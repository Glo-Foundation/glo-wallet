import Image from "next/image";

import { ICard } from "./types";

export function InfoCard(props: { data: ICard }) {
  const { data } = props;
  return (
    <div
      className={`
        bg-white shadow-sm rounded-lg
         border-white border p-3 flex 
         flex-col items-center justify-center text-center
    `}
    >
      <Image
        src={data.image}
        width={25}
        height={25}
        alt="arrow-right"
        className="flex w-25px max-w-25px h-25px max-h-25px"
      />
      <h2 className="my-0 py-3">{data.count}</h2>
      <p className="text-sm text-muted font-thin">{data.title}</p>
    </div>
  );
}
