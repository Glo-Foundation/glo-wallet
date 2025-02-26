import { optimism } from "@wagmi/core/chains";
import { parseUnits } from "ethers";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useAccount, useBalance, useSwitchChain } from "wagmi";

import StepCard from "@/components/Modals/StepCard";
import { chainConfig } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import {
  getCoinbaseOnRampUrl,
  getUSDCContractAddress,
  POPUP_PROPS,
} from "@/utils";

interface Props {
  buyAmount: number;
}

export default function BuyWithCoinbaseSequenceModal({ buyAmount }: Props) {
  const { address, chain } = useAccount();
  const { closeModal } = useContext(ModalContext);

  const { data: balance } = useBalance({
    address,
    token: getUSDCContractAddress(chain!),
    query: {
      gcTime: 2_000,
    },
  });
  const { switchChain } = useSwitchChain();
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const [isCoinbaseStepDone, setIsCoinbaseStepDone] = useState(false);
  const [USDC, setUSDC] = useState("");

  const userIsOnOptimism = chain?.id === optimism.id;

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  useEffect(() => {
    if (balance) {
      const formatted = Number(balance?.formatted);
      const val = BigInt(balance?.value);
      const currBuyAmt =
        (parseUnits(buyAmount.toString(), 6) * BigInt(99)) / BigInt(100);

      const usdc = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(formatted || 0);
      setUSDC(usdc);
      if (val >= currBuyAmt) setIsCoinbaseStepDone(true);
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
          onClick={() => closeModal()}
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
          Buying Glo Dollars through Coinbase and Sequence
        </h3>
        <p className="text-sm py-6">
          You can get Glo Dollars by exchanging another stablecoin called{" "}
          <b>USDC</b> for Glo Dollar using the <b>Sequence</b> app.
        </p>
      </section>
      <section>
        <StepCard
          index={1}
          iconPath="/optimism-logo.svg"
          title={"Switch to Optimism network"}
          content="Please confirm the switch in your wallet"
          action={() => {
            switchChain!({ chainId: optimism.id });
          }}
          done={userIsOnOptimism}
        />
        <StepCard
          index={2}
          iconPath="/coinbase-invert.svg"
          title={`Buy ${buyAmount} USDC on Coinbase`}
          content="Withdraw to the wallet address shown above"
          action={() => {
            window.open(
              getCoinbaseOnRampUrl(
                address!,
                buyAmount,
                `${window.location.origin}/purchased-sequence`,
                chain
              ),
              "_blank",
              POPUP_PROPS
            );
          }}
          done={isCoinbaseStepDone}
          USDC={USDC}
        />
        <StepCard
          index={3}
          iconPath="/sequence.svg"
          title={`Swap ${buyAmount} Glo Dollars on Sequence`}
          content={`Swap ${buyAmount} Glo Dollars for ${buyAmount} USDC`}
          action={() => {
            if (chain) {
              const url = `https://sequence.app/wallet/swap?chainId=${
                chain.id
              }&from=${getUSDCContractAddress(chain)}&to=${
                chainConfig[chain.id]
              }`;
              window.open(url, "_blank");
            }
          }}
        />
      </section>
    </div>
  );
}
