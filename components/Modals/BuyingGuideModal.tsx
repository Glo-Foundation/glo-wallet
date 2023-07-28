import { polygon } from "@wagmi/chains";
import clsx from "clsx";
import { BigNumber, utils } from "ethers";
import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount, useBalance, useNetwork, useSwitchNetwork } from "wagmi";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { buyWithUniswap } from "@/payments";
import { USDC_POLYGON_CONTRACT_ADDRESS } from "@/utils";

const formatter = Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
interface Props {
  iconPath: string;
  buyWithProvider: () => void;
  provider: string;
  buyAmount: number;
}

export default function BuyingGuide({
  iconPath,
  buyWithProvider,
  provider,
  buyAmount,
}: Props) {
  const { address, connector } = useAccount();
  const { closeModal } = useContext(ModalContext);

  const { chain } = useNetwork();
  const { data: balance } = useBalance({
    address,
    token: USDC_POLYGON_CONTRACT_ADDRESS,
  });
  const { switchNetwork } = useSwitchNetwork();
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const [isProviderStepDone, setIsProviderStepDone] = useState(false);
  const [isUniswapStepDone, setIsUniswapStepDone] = useState(false);
  const [isSequenceStepDone, setIsSequenceStepDone] = useState(false);

  const userIsOnPolygon = chain?.id === polygon.id;
  const isSequenceWallet = connector?.id === "sequence";

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  useEffect(() => {
    const formatted = Number(balance?.formatted);
    const val = BigNumber.from(balance?.value);
    const currBuyAmt = utils
      .parseUnits(buyAmount.toString(), 6)
      .mul(99)
      .div(100);

    const usdc = Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(formatted || 0);
    setUSDC(usdc);

    if (val.gte(currBuyAmt)) setIsProviderStepDone(true);
  }, [balance]);

  const StepCard = ({
    index,
    iconPath,
    title,
    content,
    action,
    done = false,
  }: {
    index: number;
    iconPath: string;
    title: string;
    content: string;
    action: any;
    done?: boolean;
  }) => (
    <div
      className={clsx(
        "cursor-pointer flex flex-col justify-center border-2 rounded-xl border-pine-100 hover:border-pine-400 mb-2",
        done && "bg-cyan-600/20"
      )}
      onClick={action}
    >
      <div className="flex flex-col justify-center">
        <div className="flex items-center p-3">
          <div
            className={clsx(
              "relative circle border-2 w-[32px] h-[32px]",
              done && "border-none bg-cyan-600 w-[32px] h-[32px]"
            )}
          >
            {!done ? (
              index
            ) : (
              <Image
                alt="checkmark"
                src="check-alpha.svg"
                height={12}
                width={12}
              />
            )}
            <div
              className={clsx(
                "circle w-[20px] h-[20px] absolute top-[-7px] right-[-10px]",
                done && "top-[-5px] right-[-8px]"
              )}
            >
              <Image alt={iconPath} src={iconPath} height={20} width={20} />
            </div>
          </div>
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
        {index === 2 && (
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

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-2">
      <div className="flex flex-row justify-between p-3">
        <div></div>
        <Tooltip id="copy-deposit-tooltip" isOpen={isCopiedTooltipOpen} />
        <button
          className="copy cursor-pointer border-2 rounded-full border-cyan-200 px-3 py-1"
          data-tooltip-id="copy-deposit-tooltip"
          data-tooltip-content="Copied!"
          onClick={() => {
            navigator.clipboard.writeText(address!);
            setIsCopiedTooltipOpen(true);
          }}
        >
          🔗 {sliceAddress(address!)}
        </button>
        <button onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <section className="text-center">
        <h3 className="pt-0">
          Buying Glo Dollars through {provider} and Uniswap
        </h3>
        <p className="text-sm py-6">
          You can get Glo Dollars by exchanging another stablecoin called{" "}
          <b>USDC</b> for Glo Dollar using the <b>Uniswap</b> app.
        </p>
      </section>
      <section>
        <StepCard
          index={1}
          iconPath="/polygon.svg"
          title={"Switch to the Polygon network"}
          content="Please confirm the switch in your wallet"
          action={() => {
            switchNetwork!(polygon.id);
          }}
          done={userIsOnPolygon}
        />
        <StepCard
          index={2}
          iconPath={iconPath}
          title={`Buy ${buyAmount} USDC on ${provider}`}
          content="Withdraw to the wallet address shown above"
          action={() => {
            buyWithProvider();
            setIsProviderStepDone(true);
          }}
          done={
            isProviderStepDone ||
            (balance &&
              BigNumber.from(balance.value).gte(
                utils.parseUnits(buyAmount.toString(), 6).mul(99).div(100)
              ))
          }
        />
        <StepCard
          index={3}
          iconPath="/uniswap.svg"
          title={
            isSequenceWallet
              ? `Connect wallet on Uniswap`
              : `Buy Glo through Uniswap`
          }
          content={
            isSequenceWallet
              ? `Choose WalletConnect and click `
              : `Connect your wallet and click \"Swap\"`
          }
          action={() => {
            isSequenceWallet
              ? window.open("https://app.uniswap.org/", "_blank")
              : buyWithUniswap(buyAmount);
            setIsUniswapStepDone(true);
          }}
          done={isUniswapStepDone}
        />
        {isSequenceWallet && (
          <StepCard
            index={4}
            iconPath="/sequence.svg"
            title={"Connect to the Sequence wallet"}
            content="Paste the code into the wallet's scanner"
            action={() => {
              window.open("https://sequence.app/wallet/scan", "_blank");
              setIsSequenceStepDone(true);
            }}
            done={isSequenceStepDone}
          />
        )}
      </section>
      <section className="flex justify-center mt-6 mb-3">
        <button
          className="primary-button"
          onClick={() => buyWithUniswap(buyAmount)}
        >
          Buy ${buyAmount} Glo Dollars on Uniswap
        </button>
      </section>
    </div>
  );
}
