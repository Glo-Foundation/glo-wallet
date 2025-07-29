import { Token } from "@coinbase/onchainkit/token";
import { useConnex, useWallet } from "@vechain/dapp-kit-react";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { base, baseSepolia, celo, celoAlfajores, vechain } from "viem/chains";
import { useAccount, useBalance } from "wagmi";

import { getCoinbaseSessionToken } from "@/fetchers";
import { addVeChainLiquidity, getVeChainTokenBalance } from "@/lib/betterswap";
import {
  B3TR,
  token0,
  token1,
  USDGLO,
  VECHAIN_B3TR_USDGLO_POOL,
} from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { usePairReserves } from "@/lib/usePairReserves";
import { useQuote } from "@/lib/useQuote";
import { sliceAddress } from "@/lib/utils";
import { getCoinbaseOnRampUrl, POPUP_PROPS } from "@/utils";

import RemoveLiquidityModal from "./RemoveLiquidityModal";
import SquidModal from "./SquidModal";
import StepCard from "./StepCard";

interface Props {
  buyAmount: number;
}

export default function LiquidityModal({ buyAmount }: Props) {
  const { address, chain } = useAccount();
  const { openModal, closeModal } = useContext(ModalContext);

  // VeChain wallet integration
  const { account: veAddress } = useWallet();
  const connex = useConnex();

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const [isTokenForm, setIsTokenForm] = useState(true);
  const [b3trVeBalance, setB3trVeBalance] = useState<bigint>(BigInt(0));
  const [usdgloVeBalance, setUsdgloVeBalance] = useState<bigint>(BigInt(0));
  const [lpTokenVeBalance, setLpTokenVeBalance] = useState<bigint>(BigInt(0));

  // Liquidity form state
  const [b3trAmount, setB3trAmount] = useState<string>("");
  const [usdgloAmount, setUsdgloAmount] = useState<string>("");
  const [isB3trInput, setIsB3trInput] = useState(true); // Track which input was last modified
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);

  const isBase = base.id === chain?.id || baseSepolia.id === chain?.id;
  const isCelo = celo.id === chain?.id || celoAlfajores.id === chain?.id;
  const isVe = !!veAddress;

  // Standard EVM balances
  const { data: b3trBalance } = useBalance({
    address,
    token: B3TR,
    query: {
      gcTime: 3_000,
    },
  });

  const { data: usdgloBalance } = useBalance({
    address,
    token: USDGLO,
    query: {
      gcTime: 3_000,
    },
  });

  const { data: lpTokenBalance } = useBalance({
    address,
    token: VECHAIN_B3TR_USDGLO_POOL,
    query: {
      gcTime: 3_000,
    },
  });

  // Fetch pair reserves
  const { data: reserves, isLoading: reservesLoading } = usePairReserves({
    pairAddress: VECHAIN_B3TR_USDGLO_POOL,
    chainId: isVe ? vechain.id : chain?.id,
    enabled: isVe || !!address,
  });

  // Parse input amounts to BigInt
  const b3trAmountBigInt = b3trAmount
    ? BigInt(Math.floor(parseFloat(b3trAmount) * 1e18))
    : BigInt(0);
  const usdgloAmountBigInt = usdgloAmount
    ? BigInt(Math.floor(parseFloat(usdgloAmount) * 1e18))
    : BigInt(0);

  // Quote calculation for B3TR -> USDGLO (when B3TR is input)
  const { data: usdgloQuote, isLoading: usdgloQuoteLoading } = useQuote({
    amountA: b3trAmountBigInt,
    reserveA: reserves
      ? B3TR === token1
        ? reserves.reserve1
        : reserves.reserve0
      : undefined,
    reserveB: reserves
      ? USDGLO === token0
        ? reserves.reserve0
        : reserves.reserve1
      : undefined,
    chainId: isVe ? vechain.id : chain?.id,
    enabled: Boolean(
      b3trAmount && reserves && isB3trInput && b3trAmountBigInt > BigInt(0)
    ),
    useClientSide: true,
  });

  // Quote calculation for USDGLO -> B3TR (when USDGLO is input)
  const { data: b3trQuote, isLoading: b3trQuoteLoading } = useQuote({
    amountA: usdgloAmountBigInt,
    reserveA: reserves
      ? USDGLO === token0
        ? reserves.reserve0
        : reserves.reserve1
      : undefined,
    reserveB: reserves
      ? B3TR === token1
        ? reserves.reserve1
        : reserves.reserve0
      : undefined,
    chainId: isVe ? vechain.id : chain?.id,
    enabled: Boolean(
      usdgloAmount && reserves && !isB3trInput && usdgloAmountBigInt > BigInt(0)
    ),
    useClientSide: true,
  });

  const gloToken: Token = {
    name: "USDGLO",
    address: USDGLO,
    symbol: "USDGLO",
    decimals: 18,
    image: "https://app.glodollar.org/glo-logo.png",
    chainId: chain?.id || base.id,
  };

  const b3trToken: Token = {
    name: "B3TR",
    address: B3TR,
    symbol: "B3TR",
    decimals: 18,
    image: "https://vechainstats.com/assets/media/token-icon_b3tr.png?r=1.4",
    chainId: chain?.id || base.id,
  };

  // Fetch VeChain balances
  useEffect(() => {
    if (veAddress && isVe) {
      const fetchVeBalances = async () => {
        try {
          const [b3trBal, usdgloBal, lpBal] = await Promise.all([
            getVeChainTokenBalance(B3TR, veAddress, vechain.id),
            getVeChainTokenBalance(USDGLO, veAddress, vechain.id),
            getVeChainTokenBalance(
              VECHAIN_B3TR_USDGLO_POOL,
              veAddress,
              vechain.id
            ),
          ]);
          setB3trVeBalance(b3trBal);
          setUsdgloVeBalance(usdgloBal);
          setLpTokenVeBalance(lpBal);
        } catch (error) {
          console.error("Error fetching VeChain balances:", error);
        }
      };
      fetchVeBalances();
    } else if (address && !isVe) {
      // For EVM chains, we would fetch LP balance differently
      // For now, just set to 0 since we're focusing on VeChain
      setLpTokenVeBalance(BigInt(0));
    }
  }, [veAddress, isVe, address]);

  // Update calculated amounts when quotes change
  useEffect(() => {
    if (isB3trInput && usdgloQuote) {
      setUsdgloAmount(usdgloQuote.formatted);
    }
  }, [usdgloQuote, isB3trInput]);

  useEffect(() => {
    if (!isB3trInput && b3trQuote) {
      setB3trAmount(b3trQuote.formatted);
    }
  }, [b3trQuote, isB3trInput]);

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const back = () => (isTokenForm ? setIsTokenForm(false) : closeModal());

  // Format balances for display
  const formatBalance = (balance: bigint, decimals = 18): string => {
    return (Number(balance) / Math.pow(10, decimals)).toFixed(4);
  };

  const displayAddress = isVe ? veAddress : address;

  // Input handlers
  const handleB3trAmountChange = (value: string) => {
    setB3trAmount(value);
    setIsB3trInput(true);
    if (!value || value === "0") {
      setUsdgloAmount("");
    }
  };

  const handleUsdgloAmountChange = (value: string) => {
    setUsdgloAmount(value);
    setIsB3trInput(false);
    if (!value || value === "0") {
      setB3trAmount("");
    }
  };

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
            navigator.clipboard.writeText(displayAddress!);
            setIsCopiedTooltipOpen(true);
          }}
        >
          🔗 {sliceAddress(displayAddress!)}
        </button>
        <button onClick={() => back()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      {isTokenForm ? (
        <section className="flex flex-col space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Manage Liquidity</div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button className="px-3 py-1 text-sm font-medium bg-white shadow-sm rounded-md text-gray-900">
                Add
              </button>
              <button
                onClick={() => openModal(<RemoveLiquidityModal />)}
                className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Balance Display */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="text-sm font-medium text-gray-700">
              Your Balances
            </div>
            <div className="space-y-3">
              {/* Token Balances */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={b3trToken.image || ""}
                      alt="B3TR"
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium">B3TR</span>
                  </div>
                  <span className="text-sm">
                    {isVe
                      ? formatBalance(b3trVeBalance)
                      : formatBalance(b3trBalance?.value || BigInt(0))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={gloToken.image || ""}
                      alt="USDGLO"
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium">USDGLO</span>
                  </div>
                  <span className="text-sm">
                    {isVe
                      ? formatBalance(usdgloVeBalance)
                      : formatBalance(usdgloBalance?.value || BigInt(0))}
                  </span>
                </div>
              </div>

              {/* LP Token Balance */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">LP</span>
                    </div>
                    <span className="text-sm font-medium">B3TR-USDGLO LP</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {isVe
                      ? formatBalance(lpTokenVeBalance)
                      : formatBalance(lpTokenBalance?.value || BigInt(0))}
                  </span>
                </div>
                {((isVe && lpTokenVeBalance > BigInt(0)) ||
                  (!isVe &&
                    lpTokenBalance?.value &&
                    lpTokenBalance.value > BigInt(0))) && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">
                      You have liquidity in this pool
                    </div>
                    <button
                      onClick={() => openModal(<RemoveLiquidityModal />)}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-md transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Custom Liquidity Input Form */}
          <div className="space-y-4">
            {/* B3TR Input */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Token A
                </label>
                <span className="text-xs text-gray-500">
                  Balance:{" "}
                  {isVe
                    ? formatBalance(b3trVeBalance)
                    : formatBalance(b3trBalance?.value || BigInt(0))}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                  <img
                    src={b3trToken.image || ""}
                    alt="B3TR"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium">B3TR</span>
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  value={b3trAmount}
                  onChange={(e) => handleB3trAmountChange(e.target.value)}
                  className="flex-1 text-right text-lg font-semibold bg-transparent border-none outline-none"
                  step="any"
                />
              </div>
              {isB3trInput && usdgloQuoteLoading && (
                <div className="text-xs text-blue-500 mt-1">
                  Calculating quote...
                </div>
              )}
            </div>

            {/* Plus Icon */}
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">+</span>
              </div>
            </div>

            {/* USDGLO Input */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Token B
                </label>
                <span className="text-xs text-gray-500">
                  Balance:{" "}
                  {isVe
                    ? formatBalance(usdgloVeBalance)
                    : formatBalance(usdgloBalance?.value || BigInt(0))}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                  <img
                    src={gloToken.image || ""}
                    alt="USDGLO"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium">USDGLO</span>
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  value={usdgloAmount}
                  onChange={(e) => handleUsdgloAmountChange(e.target.value)}
                  className="flex-1 text-right text-lg font-semibold bg-transparent border-none outline-none"
                  step="any"
                />
              </div>
              {!isB3trInput && b3trQuoteLoading && (
                <div className="text-xs text-blue-500 mt-1">
                  Calculating quote...
                </div>
              )}
            </div>

            {/* Price Information */}
            {reserves && (b3trAmount || usdgloAmount) && (
              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                <div className="text-sm font-medium text-blue-900">
                  Pool Information
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>
                    Pool Reserves: {formatBalance(reserves.reserve1)} B3TR,{" "}
                    {formatBalance(reserves.reserve0)} USDGLO
                  </div>
                  {(usdgloQuote || b3trQuote) && (
                    <div>
                      Exchange Rate: 1 {isB3trInput ? "B3TR" : "USDGLO"} ={" "}
                      {isB3trInput
                        ? usdgloQuote?.price.toFixed(6)
                        : b3trQuote?.inversePrice.toFixed(6)}{" "}
                      {isB3trInput ? "USDGLO" : "B3TR"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            className={`py-3 px-6 rounded-lg font-medium mt-4 transition-colors ${
              b3trAmount &&
              usdgloAmount &&
              !reservesLoading &&
              !isAddingLiquidity &&
              (isVe ? veAddress : address)
                ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={async () => {
              if (
                b3trAmount &&
                usdgloAmount &&
                (isVe ? veAddress : address) &&
                !isAddingLiquidity
              ) {
                try {
                  setIsAddingLiquidity(true);
                  console.log("Adding liquidity:", {
                    b3trAmount,
                    usdgloAmount,
                  });

                  if (isVe && connex && veAddress) {
                    // VeChain transaction using Connex
                    const result = await addVeChainLiquidity(
                      connex,
                      B3TR, // tokenA
                      USDGLO, // tokenB
                      b3trAmountBigInt, // amountADesired
                      usdgloAmountBigInt, // amountBDesired
                      veAddress, // userAddress
                      0.5 // 0.5% slippage tolerance
                    );
                    console.log("Liquidity added successfully:", result);

                    // Clear form after successful transaction
                    setB3trAmount("");
                    setUsdgloAmount("");
                  } else {
                    // EVM transaction would go here
                    console.log("EVM liquidity addition not implemented yet");
                  }

                  closeModal();
                } catch (error) {
                  console.error("Failed to add liquidity:", error);
                  // You might want to show an error toast here
                } finally {
                  setIsAddingLiquidity(false);
                }
              }
            }}
            disabled={
              !b3trAmount ||
              !usdgloAmount ||
              reservesLoading ||
              isAddingLiquidity ||
              !(isVe ? veAddress : address)
            }
          >
            {reservesLoading
              ? "Loading..."
              : isAddingLiquidity
              ? "Adding Liquidity..."
              : "Add Liquidity"}
          </button>
        </section>
      ) : (
        <section>
          <StepCard
            index={1}
            iconPath="/coinbase-invert.svg"
            title={`Buy ${buyAmount} USDC ${
              isCelo ? "(Base)" : ""
            } on Coinbase`}
            content="Withdraws to the connected wallet address"
            action={async () => {
              const sessionToken = await getCoinbaseSessionToken(chain);

              window.open(
                getCoinbaseOnRampUrl(
                  buyAmount,
                  `${window.location.origin}/purchased-sequence`,
                  sessionToken
                ),
                "_blank",
                POPUP_PROPS
              );
            }}
            done={(b3trBalance?.value || 0) >= BigInt(buyAmount)}
            USDC={b3trBalance?.formatted}
          />
          {isBase ? (
            <StepCard
              index={2}
              iconPath="/coinbase-invert.svg"
              title={`Add Liquidity with B3TR and USDGLO`}
              content={"Add liquidity to the pool"}
              action={() => setIsTokenForm(true)}
            />
          ) : (
            <StepCard
              index={2}
              iconPath="/squidrouter.svg"
              title={
                isCelo
                  ? `Swap ${buyAmount} USDC (Base) to USDGLO (Celo)`
                  : `Swap ${buyAmount} USDC to USDGLO`
              }
              content={"Swap with Squid Router"}
              action={() =>
                openModal(
                  <SquidModal
                    buyAmount={buyAmount}
                    gloChain={isCelo ? base : undefined}
                  />
                )
              }
            />
          )}
        </section>
      )}
    </div>
  );
}
