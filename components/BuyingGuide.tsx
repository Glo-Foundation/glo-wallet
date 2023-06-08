import Image from "next/image";
import { useAccount } from "wagmi";

import { getUSFormattedNumber } from "@/utils";

type Props = {
  glo: number;
  closeModal: any;
};

export default function BuyingGuide({ glo, closeModal }: Props) {
  const { address } = useAccount();
  const formattedGlo = getUSFormattedNumber(glo);

  return (
    <>
      <div className="flex flex-col bg-pine-50 text-pine-900 pt-[28px] px-[23px] pb-[20px]">
        <div className="flex flex-row justify-between">
          <div></div>
          <button className="" onClick={() => closeModal()}>
            <Image alt="x" src="/x.svg" height={16} width={16} />
          </button>
        </div>
        <div className="text-4xl text-[42px]">Buying Glo</div>
        <div className="text-2xl">A step by step guide</div>
      </div>
      <div className="flex flex-col space-y-4 text-pine-900 mt-3 mb-5 mx-4 text-sm">
        <div>
          As Glo is in beta you can only get Glo by exchanging it with USDC
          using an app called Uniswap. This process consists of 12 steps:
        </div>

        <ol className="list-decimal mx-4">
          <li>Create an account with Coinbase</li>
          <li>Buy {formattedGlo} USDC on Coinbase via wire transfer</li>
          <li className="break-words">
            Send {formattedGlo} USDC to: {address} 🔗 on Polygon
          </li>
          <li>Go to app.uniswap.com</li>
          <li>Click connect and choose WalletConnect</li>
          <li>Switch to “QR Code” mode</li>
          <li>Click on “Copy to clipboard”</li>
          <li>On this app’s main page select “Scan”</li>
          <li>Click WalletConnect to paste and connect</li>
          <li>Visit the USDC {"<>"} Glo page on Uniswap 👇</li>
          <li>Input {formattedGlo} USDC and click “Swap”</li>
          <li>Complete the Uniswap steps to buy {formattedGlo} Glo!</li>
        </ol>
      </div>
    </>
  );
}
