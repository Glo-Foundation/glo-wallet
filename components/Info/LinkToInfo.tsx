import Image from "next/image";

export function LinkToInfoPage() {
  return (
    <a className="cta" href={"/info"} rel="noreferrer">
      <button className="flex border justify-center min-w-[40px] min-h-[40px] rounded-full bg-pine-200">
        <Image
          src={"/coinbase.png"}
          width={16}
          height={16}
          alt="call to action"
        />
      </button>

      <div className="flex-col w-56 ml-[16px]">
        <h5>Info Page</h5>
        <p className="mt-1 text-xs text-pine-700 whitespace-pre-line">
          View more information about the glo community.
        </p>
      </div>

      <Image
        src="/arrow-right.svg"
        width={25}
        height={25}
        alt="arrow-right"
        className="ml-2 flex w-25px max-w-25px h-25px max-h-25px"
      />
    </a>
  );
}
