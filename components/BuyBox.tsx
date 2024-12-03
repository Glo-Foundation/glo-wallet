import clsx from "clsx";
import Image from "next/image";

export const BuyBox = ({
  name,
  icon,
  fees,
  worksFor,
  delay,
  onClick,
  disabled = false,
}: {
  name: string;
  icon: string;
  fees: string;
  worksFor: string;
  delay: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <div
    id={name}
    className={clsx(
      "flex flex-col p-3 border-2 rounded-xl border-pine-100 hover:border-pine-800 cursor-pointer mb-2",
      disabled && "bg-pine-100 hover:border-pine-100"
    )}
    onClick={!disabled ? onClick : undefined}
  >
    <div className="flex py-2">
      <Image alt={name} src={icon} height={28} width={28} />

      <h3 className="px-3">{name}</h3>
    </div>
    <div className="flex">
      <Double className="min-w-[18%]" label="Fees" value={`${fees}%`} />
      <Double className="min-w-[36%]" label="Works for" value={worksFor} />
      <Double className="min-w-[40%]" label="Delay" value={delay} />
    </div>
  </div>
);

const Double = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) => (
  <div className={clsx("mr-5", className)}>
    <div className="text-pine-700">{label}</div>
    <div className="text-black font-bold"> {value}</div>
  </div>
);
