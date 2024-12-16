import { SwapDefault } from "@coinbase/onchainkit/swap";
import { Token } from "@coinbase/onchainkit/token";
import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { base, baseSepolia, celo, celoAlfajores, polygon } from "viem/chains";
import { useAccount, useBalance } from "wagmi";

import { getSmartContractAddress } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { buyWithJumper } from "@/payments";
import { getOnRampUrl, getUSDCContractAddress, POPUP_PROPS } from "@/utils";

import StepCard from "./StepCard";

interface Props {
  buyAmount: number;
}

export default function SwapModal({ buyAmount }: Props) {
  const { address, chain } = useAccount();
  const { closeModal } = useContext(ModalContext);

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const [isSwapForm, setIsSwapForm] = useState(false);

  const isBase = base.id === chain?.id || baseSepolia.id === chain?.id;
  const isCelo = celo.id === chain?.id || celoAlfajores.id === chain?.id;

  const { data: gloBalance } = useBalance({
    address,
    token: getSmartContractAddress(chain?.id),
    query: {
      gcTime: 3_000,
    },
  });
  const { data: usdcBalance } = useBalance({
    address,
    token: getUSDCContractAddress(chain!),
    query: {
      gcTime: 3_000,
    },
  });

  const gloToken: Token = {
    name: "USDGLO",
    address: getSmartContractAddress(chain?.id || base.id),
    symbol: "USDGLO",
    decimals: 18,
    image: "https://app.glodollar.org/glo-logo.png",
    chainId: chain?.id || base.id,
  };

  const usdcToken: Token = {
    name: "USDC",
    address: getUSDCContractAddress(chain || base),
    symbol: "USDC",
    decimals: 6,
    image:
      "https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTg0NjQtMWI4OGEwYjBiODE2",
    chainId: chain?.id || base.id,
  };

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const back = () => (isSwapForm ? setIsSwapForm(false) : closeModal());

  return (
    <div className="flex flex-col text-pine-900 p-2">
      <div className="flex flex-row justify-between p-3">
        <Image
          src="/arrow-right.svg"
          width={25}
          height={25}
          alt="arrow-right"
          className="flex w-25px max-w-25px h-25px max-h-25px scale-x-[-1] cursor-pointer -translate-x-1"
          onClick={() => back()}
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
        <button onClick={() => back()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      {isSwapForm ? (
        <section className="flex">
          <SwapDefault from={[usdcToken]} to={[gloToken]} />
        </section>
      ) : (
        <section>
          <StepCard
            index={1}
            iconPath="/coinbase-invert.svg"
            title={
              isCelo
                ? "Celo not supported."
                : `Buy ${buyAmount} USDC on Coinbase`
            }
            content={
              isCelo
                ? "Switch to a different chain like Optimism"
                : "Withdraw to the wallet address shown above"
            }
            action={() =>
              !isCelo &&
              window.open(
                getOnRampUrl(
                  address!,
                  buyAmount,
                  `${window.location.origin}/purchased-coinbase`,
                  chain
                ),
                "_blank",
                POPUP_PROPS
              )
            }
            done={(usdcBalance?.value || 0) >= BigInt(buyAmount)}
            USDC={usdcBalance?.formatted}
          />
          {isBase ? (
            <StepCard
              index={2}
              iconPath="/coinbase-invert.svg"
              title="Swap USDGLO for USDC"
              content={"Swap with Coinbase"}
              action={() => setIsSwapForm(true)}
              done={(gloBalance?.value || 0) >= BigInt(buyAmount)}
              USDC={usdcBalance?.formatted}
            />
          ) : (
            <StepCard
              index={2}
              iconPath="/jumper.svg"
              title="Swap USDGLO for USDC"
              content={"Swap with Jumper.exchange"}
              action={() => buyWithJumper(chain || polygon)}
              done={(gloBalance?.value || 0) >= BigInt(buyAmount)}
              USDC={usdcBalance?.formatted}
            />
          )}
        </section>
      )}
    </div>
  );
}
