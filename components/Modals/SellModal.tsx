import { SwapDefault } from "@coinbase/onchainkit/swap";
import { Token } from "@coinbase/onchainkit/token";
import { useWallet } from "@vechain/dapp-kit-react";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { base, baseSepolia, celo, celoAlfajores } from "viem/chains";
import { useAccount, useBalance } from "wagmi";

import { getCoinbaseSessionToken } from "@/fetchers";
import { chainConfig, getSmartContractAddress } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { sliceAddress } from "@/lib/utils";
import { sellWithBetterSwap } from "@/payments";
import {
  getCoinbaseOffRampUrl,
  getUSDCContractAddress,
  POPUP_PROPS,
} from "@/utils";

import SquidModal from "./SquidModal";
import StepCard from "./StepCard";

interface Props {
  sellAmount: number;
}

export default function SellModal({ sellAmount }: Props) {
  const { address: wagmiAddress, chain, connector } = useAccount();
  const { openModal, closeModal } = useContext(ModalContext);

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const [isSwapForm, setIsSwapForm] = useState(false);

  const isBase = base.id === chain?.id || baseSepolia.id === chain?.id;
  const isCelo = celo.id === chain?.id || celoAlfajores.id === chain?.id;

  const isCoinbaseWallet = connector?.id === "coinbaseWalletSDK";
  const isSequenceWallet = connector?.id === "sequence";

  const forceBaseTarget = isCoinbaseWallet && isCelo;

  const { account: veAccount } = useWallet();
  const address = wagmiAddress || (veAccount as `0x${string}` | undefined);
  const isVe = !!veAccount;

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

  const SquidStep = () => (
    <StepCard
      iconPath="/squidrouter.svg"
      title={`Swap ${sellAmount} USDGLO to USDC`}
      content="Powered by Squid Router"
      action={() => openModal(<SquidModal buyAmount={-sellAmount} />)}
    />
  );

  const usdc = Math.floor(parseFloat(usdcBalance?.formatted || "0"));

  const SequenceSwap = () => (
    <section>
      <StepCard
        index={1}
        iconPath="/sequence.svg"
        title={`Swap ${sellAmount} Glo Dollars on Sequence`}
        content={`Swap ${sellAmount} Glo Dollars to ${sellAmount} USDC`}
        action={() => {
          if (chain) {
            const url = `https://sequence.app/wallet/swap?chainId=${
              chain.id
            }&to=${getUSDCContractAddress(chain)}&from=${
              chainConfig[chain.id]
            }`;
            window.open(url, "_blank");
          }
        }}
        done={usdc >= sellAmount}
        USDC={usdcBalance?.formatted}
      />
      <OfframpStep />
    </section>
  );
  const OfframpStep = () => (
    <StepCard
      index={2}
      iconPath="/coinbase-invert.svg"
      title={`Sell ${usdc} USDC on Coinbase`}
      content="Withdraws to the connected wallet address"
      action={async () => {
        const sessionToken = await getCoinbaseSessionToken(chain);
        window.open(
          getCoinbaseOffRampUrl(
            address!,
            usdc,
            `${window.location.origin}/purchased-coinbase`,
            sessionToken
          ),
          "_blank",
          POPUP_PROPS
        );
      }}
    />
  );

  const CoinbaseSwap = () =>
    isSwapForm ? (
      <section className="flex">
        <SwapDefault
          from={[gloToken]}
          to={[usdcToken]}
          onSuccess={() => closeModal()}
        />
      </section>
    ) : (
      <section>
        {isBase ? (
          <StepCard
            index={1}
            iconPath="/coinbase-invert.svg"
            title={`Swap ${sellAmount} USDGLO to USDC`}
            content={"Swap with Coinbase"}
            action={() => setIsSwapForm(true)}
            done={usdc >= sellAmount}
            USDC={usdcBalance?.formatted}
          />
        ) : (
          <StepCard
            index={1}
            iconPath="/squidrouter.svg"
            title={
              forceBaseTarget
                ? `Swap ${sellAmount} USDGLO (Celo) to USDC (Base)`
                : `Swap ${sellAmount} USDGLO to USDC`
            }
            content="Powered by Squid Router"
            action={() =>
              openModal(
                <SquidModal
                  buyAmount={-sellAmount}
                  usdcChain={forceBaseTarget ? base : undefined}
                />
              )
            }
            done={usdc >= sellAmount}
            USDC={usdcBalance?.formatted}
          />
        )}
        <OfframpStep />
      </section>
    );

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
      {isVe ? (
        <section className="w-[300px]">
          <StepCard
            iconPath="/betterswap.png"
            blackBg
            title="Swap USDGLO to VET"
            content="Powered by Betterswap"
            action={() => sellWithBetterSwap(sellAmount)}
          />
        </section>
      ) : isCoinbaseWallet ? (
        <CoinbaseSwap />
      ) : isSequenceWallet ? (
        <SequenceSwap />
      ) : (
        <section>
          <StepCard
            iconPath="/peanut.png"
            title="Withdraw to bank account in EU or USA"
            content="Powered by Peanut Protocol"
            action={() => window.open("https://peanut.to/cashout", "_blank")}
          />
          <StepCard
            iconPath="/offramp.svg"
            title="Pay with debit card in 160+ countries"
            content="Powered by Offramp.xyz"
            action={() => window.open("https://app.offramp.xyz", "_blank")}
          />
          <SquidStep />
        </section>
      )}
    </div>
  );
}
