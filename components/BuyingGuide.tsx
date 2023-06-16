import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount } from "wagmi";

import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { getUSFormattedNumber } from "@/utils";

type Props = {
  glo: number;
};

export default function BuyingGuide({ glo }: Props) {
  const { address } = useAccount();
  const { closeModal } = useContext(ModalContext);
  const formattedGlo = getUSFormattedNumber(glo);
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  return (
    <>
      <div className="flex flex-col bg-pine-50 text-pine-900 pt-[28px] px-[23px] pb-[20px]">
        <div className="flex flex-row justify-between">
          <div></div>
          <button className="" onClick={() => closeModal()}>
            <Image alt="x" src="/x.svg" height={16} width={16} />
          </button>
        </div>
        <div className="text-4xl text-[38px]">Buying Glo Dollar</div>
        <div className="text-2xl">A step by step guide</div>
      </div>
      <div className="flex flex-col space-y-4 text-pine-900 mt-3 mb-5 mx-4 text-sm">
        <div>
          You can get Glo Dollars by exchanging them for another stablecoin
          called “USDC” on “Uniswap” This process consists of 12 steps:
        </div>
        <Tooltip
          anchorId="copy-buy-wallet-address"
          content="Copied!"
          noArrow={true}
          isOpen={isCopiedTooltipOpen}
        />
        <ol className="list-decimal mx-4">
          <ul className="font-bold">Buy USDC on Coinbase</ul>
          <li>
            Create an account with{" "}
            <a href="coinbase.com" target="_blank" className="underline">
              Coinbase
            </a>
          </li>
          <li>
            Buy ${formattedGlo}{" "}
            <a
              href="https://www.coinbase.com/how-to-buy/usdc"
              target="_blank"
              className="underline" rel="noreferrer"
            >
              USDC
            </a>{" "}
            on Coinbase
          </li>
          <li className="break-words">
            Send your USDC to your Polygon wallet powered by Sequence:{" "}
            <button
              id={"copy-buy-wallet-address"}
              className="inline-block"
              onClick={() => {
                navigator.clipboard.writeText(address!);
                setIsCopiedTooltipOpen(true);
              }}
            >
              {sliceAddress(address!)} 🔗
            </button>
          </li>
          <ul className="font-bold mt-3">Connect wallet to Uniswap</ul>
          <li>
            Go to{" "}
            <a href="app.uniswap.com" target="_blank" className="underline">
              app.uniswap.com
            </a>
          </li>
          <li>Click “connect” and choose WalletConnect</li>
          <li>Switch to “QR Code” mode</li>
          <li>Click on “Copy to clipboard”</li>
          <li>On this app’s main page select “Scan”</li>
          <li>Click WalletConnect to paste and connect</li>

          <ul className="font-bold mt-3">
            Swap USDC for Glo Dollar on Uniswap
          </ul>
          <li>Click “Buy Glo on Uniswap” button below 👇</li>
          <li>Input ${formattedGlo} USDC and click “Swap”</li>
          <li>Complete the steps to swap USDC for Glo</li>
        </ol>
      </div>
    </>
  );
}
