import clsx from "clsx";
import Image from "next/image";

interface CharityCardProps {
  name: string;
  description: string;
  type: string;
  iconPath: string;
  selected?: boolean;
  percent?: number;
  onClick?: () => void;
}

const CharityCard = ({
  name,
  description,
  type,
  iconPath,
  selected,
  percent,
  onClick,
}: CharityCardProps) => (
  <div
    className={clsx(
      "flex flex-col justify-center border-2 rounded-xl border-pine-100 mb-2",
      (selected || !onClick) && "bg-cyan-600/20",
      !selected && onClick && "hover:border-pine-400",
      onClick && "cursor-pointer"
    )}
    onClick={() => onClick && onClick()}
  >
    <div className="flex flex-col justify-center">
      <div className="flex items-center p-3">
        <div className="min-w-[32px]">
          <Image
            alt={iconPath}
            src={iconPath}
            height={32}
            width={32}
            className="rounded-2xl"
          />
        </div>
        <div className="pl-4">
          <div className="flex flex-row justify-between">
            <h5 className="text-sm mb-2">{name}</h5>
            <p className="copy text-xs">{type}</p>
          </div>
          <p className="copy text-xs">
            {typeof percent === "undefined" ? description : `${percent}%`}
          </p>
        </div>

        <div className="min-w-[32px] ml-auto">
          {!onClick ? (
            <div className="circle border-2 border-none bg-cyan-600 w-[32px] h-[32px]">
              <Image
                alt="checkmark"
                src="check-alpha.svg"
                height={12}
                width={12}
              />
            </div>
          ) : (
            <div className="circle w-[32px] h-[32px]">
              <Image
                alt={iconPath}
                src={selected ? "x.svg" : "plus.svg"}
                height={16}
                width={16}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default CharityCard;
