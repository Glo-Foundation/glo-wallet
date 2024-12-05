import axios from "axios";
import Image from "next/image";
import useSWR from "swr";

import { backendUrl } from "@/lib/utils";

import { ICard } from "./types";

export function InfoCard(props: { data: ICard }) {
  const { data } = props;

  const fetcher = (url: string) =>
    axios.get(`https://app.glodollar.org${url}`).then((res) => res.data);
  // axios.get(`${backendUrl}${url}`).then((res) => res.data);

  const { data: result, isLoading } = useSWR(data.url, fetcher);

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

      {data.count ? (
        <h2 className="my-0 pb-2 pt-3">{data.count}</h2>
      ) : (
        <h2 className="my-0 pb-2 pt-3">
          {isLoading
            ? "..."
            : data.formatResult
            ? data.formatResult(result)
            : result}
        </h2>
      )}

      <p className="text-sm text-muted font-thin">{data.title}</p>
    </div>
  );
}
