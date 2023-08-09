import { sequence } from "0xsequence";
import { polygon } from "@wagmi/chains";
import { BigNumber, utils } from "ethers";
import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount, useBalance, useNetwork, useSwitchNetwork } from "wagmi";

import PaymentOptionModal from "@/components/Modals/PaymentOptionModal";
import StepCard from "@/components/Modals/StepCard";
import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { buyWithSwap } from "@/payments";
import { getUSDCContractAddress } from "@/utils";

interface Props {
  iconPath: string;
  buyWithProvider: () => void;
  provider: string;
  buyAmount: number;
}

export default function BuyWithCoinbaseModal({
  iconPath,
  buyWithProvider,
  provider,
  buyAmount,
}: Props) {
  const { address, connector } = useAccount();
  const { openModal, closeModal } = useContext(ModalContext);

  const { chain } = useNetwork();
  const { data: balance } = useBalance({
    address,
    token: getUSDCContractAddress(chain!),
    watch: true,
    cacheTime: 2_000,
  });
  const { switchNetwork } = useSwitchNetwork();
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const [isProviderStepDone, setIsProviderStepDone] = useState(false);
  const [isSwapStepDone, setIsSwapStepDone] = useState(false);
  const [isSequenceStepDone, setIsSequenceStepDone] = useState(false);
  const [USDC, setUSDC] = useState("");

  const userIsOnPolygon = chain?.id === polygon.id;
  const isSequenceWallet = connector?.id === "sequence";

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  useEffect(() => {
    if (balance) {
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
    }
  }, [balance]);

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900 p-2">
      <div className="flex flex-row justify-between p-3">
        <Image
          src="/arrow-right.svg"
          width={25}
          height={25}
          alt="arrow-right"
          className="flex w-25px max-w-25px h-25px max-h-25px scale-x-[-1] cursor-pointer -translate-x-1"
          onClick={() =>
            openModal(<PaymentOptionModal buyAmount={buyAmount} />)
          }
        />
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
          }}
          done={isProviderStepDone}
          USDC={USDC}
        />
        <StepCard
          index={3}
          iconPath="/uniswap.svg"
          title="Connect wallet on Uniswap"
          content={
            isSequenceWallet
              ? `Choose WalletConnect and click `
              : `Connect your wallet and click \"Swap\"`
          }
          action={() => {
            chain && buyWithSwap(buyAmount, chain, "Uniswap");
            setIsSwapStepDone(true);
          }}
          done={isSwapStepDone}
          isSequenceWallet={isSequenceWallet}
        />
        {isSequenceWallet && (
          <StepCard
            index={4}
            iconPath="/sequence.svg"
            title={"Connect to the Sequence wallet"}
            content="Paste the code into the wallet's scanner"
            action={() => {
              const wallet = sequence.getWallet();
              wallet.openWallet("/wallet/scan");
              setIsSequenceStepDone(true);
            }}
            done={isSequenceStepDone}
          />
        )}
      </section>
      <section className="flex flex-col justify-center m-3">
        <button
          className="primary-button"
          onClick={() => chain && buyWithSwap(buyAmount, chain, "Uniswap")}
        >
          Buy ${buyAmount} Glo Dollars on Uniswap
        </button>
        <button
          className="secondary-button mt-3"
          onClick={() =>
            window.open(
              "https://serious-jaborosa-7f8.notion.site/Guide-Buying-USDGLO-by-purchasing-USDC-on-a-centralized-exchange-and-swapping-to-USDGLO-1e376bc4e4144a02b7ca0cb13413e058",
              "_blank"
            )
          }
        >
          Step by step guide
        </button>
      </section>
    </div>
  );
}
