import Image from "next/image";
import useSWR from "swr";

import { getCurrentSelectedCharity } from "@/fetchers";
import { useUserStore } from "@/lib/store";
import { CHARITY_MAP } from "@/lib/utils";

export default function CharitySelector() {
  const { data, error, isLoading } = useSWR(
    "/charity",
    getCurrentSelectedCharity
  );

  const { setRecipientsView } = useUserStore();
  if (error) {
    console.error(error);
  }
  const selected =
    data &&
    (data.length > 1
      ? `${data.length} recipients`
      : CHARITY_MAP[data[0].name]?.short_name);

  return (
    <div className="m-1 relative z-0 flex justify-center">
      <button
        className={`flex flex-col bg-white border-2 border-cyan-600 text-impact-fg rounded-[36px] h-[32px] px-2 py-5 font-normal items-baseline`}
        onClick={() => setRecipientsView(true)}
      >
        <div className="flex w-full justify-center items-center space-y-2">
          <div className="flex items-center">
            <Image
              src={"/gear.svg"}
              width={16}
              height={16}
              alt="choose public good to fund"
            />
            <p className="ml-2 text-sm">
              {isLoading ? "Loading" : selected || "Pending"}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
