import clsx from "clsx";
import Image from "next/image";

interface Props {
  index?: number;
  iconPath: string;
  title: string;
  content: string;
  action?: any;
  done?: boolean;
  isSequenceWallet?: boolean;
  USDC?: string;
  blackBg?: boolean;
}

function Icon({
  iconPath,
  done,
  index,
  blackBg,
}: {
  iconPath: string;
  done?: boolean;
  index?: number;
  blackBg?: boolean;
}) {
  if (index) {
    return (
      <div
        className={clsx(
          "relative circle border-2 w-[32px] h-[32px]",
          done && "border-none bg-cyan-600 w-[32px] h-[32px]"
        )}
      >
        {!done ? (
          index
        ) : (
          <Image alt="checkmark" src="check-alpha.svg" height={12} width={12} />
        )}
        <div
          className={clsx(
            "circle w-[20px] h-[20px] absolute top-[-7px] right-[-10px]",
            done && "top-[-5px] right-[-8px]"
          )}
        >
          <Image
            className={clsx(blackBg && "bg-black")}
            alt={iconPath}
            src={iconPath}
            height={20}
            width={20}
          />
        </div>
      </div>
    );
  }

  return (
    <Image
      className={clsx(blackBg && "bg-black")}
      alt={iconPath}
      src={iconPath}
      height={32}
      width={32}
    />
  );
}

const StepCard = ({
  index,
  iconPath,
  title,
  content,
  action,
  done = false,
  isSequenceWallet,
  USDC,
  blackBg = false,
}: Props) => (
  <div
    className={clsx(
      "cursor-pointer flex flex-col justify-center border-2 rounded-xl border-pine-100 hover:border-pine-400 mb-2",
      done && "bg-cyan-600/20"
    )}
    onClick={action}
  >
    <div className="flex flex-col justify-center">
      <div className="flex items-center p-3">
        <Icon iconPath={iconPath} done={done} index={index} blackBg={blackBg} />
        <div className="pl-4">
          <h5 className="text-sm mb-2">{title}</h5>
          <p className="copy text-xs">
            {content}{" "}
            {index === 3 && isSequenceWallet && (
              <>
                <Image
                  alt="qrcode"
                  style={{ display: "inline" }}
                  src="/miniqr.svg"
                  height={16}
                  width={16}
                />{" "}
                +&nbsp;
                <Image
                  alt="copypaste"
                  style={{ display: "inline" }}
                  src="/copy.svg"
                  height={16}
                  width={16}
                />
              </>
            )}
          </p>
        </div>
      </div>
      {USDC && (
        <div className="p-3 border-t-2 flex justify-center w-full">
          <Image alt="usdc" src="usdc.svg" height={20} width={20} />
          <span className="ml-2 copy text-pine-900 font-bold">
            Current USDC balance: {USDC}
          </span>
        </div>
      )}
    </div>
  </div>
);

export default StepCard;
