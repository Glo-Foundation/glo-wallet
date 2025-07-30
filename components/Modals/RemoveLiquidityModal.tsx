import { Token } from "@coinbase/onchainkit/token";
import { useConnex, useWallet } from "@vechain/dapp-kit-react";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { base, vechain } from "viem/chains";
import { useAccount, useBalance } from "wagmi";

import {
  calculateRemoveLiquidityAmounts,
  getLPTokenTotalSupply,
  getVeChainTokenBalance,
  removeVeChainLiquidity,
} from "@/lib/betterswap";
import { B3TR, USDGLO, VECHAIN_B3TR_USDGLO_POOL } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { usePairReserves } from "@/lib/usePairReserves";
import { sliceAddress } from "@/lib/utils";

import LiquidityModal from "./LiquidityModal";

export default function RemoveLiquidityModal() {
  const { address, chain } = useAccount();
  const { openModal, closeModal } = useContext(ModalContext);

  // VeChain wallet integration
  const { account: veAddress } = useWallet();
  const connex = useConnex();

  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const [lpTokenVeBalance, setLpTokenVeBalance] = useState<bigint>(BigInt(0));
  const [totalSupply, setTotalSupply] = useState<bigint>(BigInt(0));
  const [lpAmountToRemove, setLpAmountToRemove] = useState<string>("");
  const [percentage, setPercentage] = useState<number>(0);
  const [isRemovingLiquidity, setIsRemovingLiquidity] = useState(false);

  const isVe = !!veAddress;

  // Standard EVM LP token balance
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

  // Fetch VeChain LP balance and total supply
  useEffect(() => {
    if (veAddress && isVe) {
      const fetchVeData = async () => {
        try {
          const [lpBal, totalSup] = await Promise.all([
            getVeChainTokenBalance(
              VECHAIN_B3TR_USDGLO_POOL,
              veAddress,
              vechain.id
            ),
            getLPTokenTotalSupply(VECHAIN_B3TR_USDGLO_POOL, vechain.id),
          ]);
          setLpTokenVeBalance(lpBal);
          setTotalSupply(totalSup);
        } catch (error) {
          console.error("Error fetching VeChain data:", error);
        }
      };
      fetchVeData();
    } else if (address && !isVe) {
      // For EVM chains, fetch total supply
      const fetchEvmData = async () => {
        try {
          const totalSup = await getLPTokenTotalSupply(
            VECHAIN_B3TR_USDGLO_POOL,
            chain?.id || base.id
          );
          setTotalSupply(totalSup);
        } catch (error) {
          console.error("Error fetching EVM data:", error);
        }
      };
      fetchEvmData();
    }
  }, [veAddress, isVe, address, chain?.id]);

  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);

  const displayAddress = isVe ? veAddress : address;
  const currentLpBalance = isVe
    ? lpTokenVeBalance
    : lpTokenBalance?.value || BigInt(0);

  // Format balances for display
  const formatBalance = (balance: bigint, decimals = 18): string => {
    return (Number(balance) / Math.pow(10, decimals)).toFixed(4);
  };

  // Calculate expected tokens to receive
  const expectedAmounts =
    reserves && lpAmountToRemove
      ? calculateRemoveLiquidityAmounts(
          BigInt(Math.floor(parseFloat(lpAmountToRemove) * 1e18)),
          totalSupply,
          reserves.reserve0, // USDGLO
          reserves.reserve1 // B3TR
        )
      : null;

  // Handle percentage input
  const handlePercentageChange = (newPercentage: number) => {
    setPercentage(newPercentage);
    if (currentLpBalance > BigInt(0)) {
      const lpAmount = (currentLpBalance * BigInt(newPercentage)) / BigInt(100);
      setLpAmountToRemove(formatBalance(lpAmount));
    }
  };

  // Handle direct LP amount input
  const handleLpAmountChange = (value: string) => {
    setLpAmountToRemove(value);
    if (currentLpBalance > BigInt(0) && value) {
      const lpAmountBigInt = BigInt(Math.floor(parseFloat(value) * 1e18));
      const newPercentage =
        Number((lpAmountBigInt * BigInt(10000)) / currentLpBalance) / 100;
      setPercentage(Math.min(newPercentage, 100));
    } else {
      setPercentage(0);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!lpAmountToRemove || !displayAddress || isRemovingLiquidity) return;

    try {
      setIsRemovingLiquidity(true);
      const lpAmountBigInt = BigInt(
        Math.floor(parseFloat(lpAmountToRemove) * 1e18)
      );

      console.log("Removing liquidity:", {
        lpAmount: lpAmountToRemove,
        percentage: percentage.toFixed(2) + "%",
        expectedTokens: expectedAmounts,
      });

      if (isVe && connex && veAddress) {
        // VeChain transaction using Connex
        const result = await removeVeChainLiquidity(
          connex,
          B3TR, // tokenA
          USDGLO, // tokenB
          lpAmountBigInt, // liquidity amount
          veAddress, // userAddress
          0.5 // 0.5% slippage tolerance
        );
        console.log("Liquidity removed successfully:", result);

        // Clear form after successful transaction
        setLpAmountToRemove("");
        setPercentage(0);
      } else {
        // EVM transaction would go here
        console.log("EVM liquidity removal not implemented yet");
      }

      // Don't autoclose modal
      // closeModal();
    } catch (error) {
      console.error("Failed to remove liquidity:", error);
      // You might want to show an error toast here
    } finally {
      setIsRemovingLiquidity(false);
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
          onClick={() => closeModal()}
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
        <button onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>

      <section className="flex flex-col space-y-4 p-4">
        {" "}
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Remove Liquidity</div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => openModal(<LiquidityModal />)}
              className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Add
            </button>
            <button className="px-3 py-1 text-sm font-medium bg-white shadow-sm rounded-md text-gray-900">
              Remove
            </button>
          </div>
        </div>
        {/* LP Balance Display */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium text-gray-700">
            Your LP Position
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">LP</span>
                </div>
                <span className="text-sm font-medium">B3TR-USDGLO LP</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {formatBalance(currentLpBalance)}
              </span>
            </div>

            {totalSupply > BigInt(0) && currentLpBalance > BigInt(0) && (
              <div className="text-xs text-gray-500">
                Your share:{" "}
                {(
                  (Number(currentLpBalance) / Number(totalSupply)) *
                  100
                ).toFixed(4)}
                % of pool
              </div>
            )}

            {reserves && currentLpBalance > BigInt(0) && (
              <div className="text-xs text-gray-600 space-y-1">
                <div>Pool Reserves:</div>
                <div className="pl-2">
                  • {formatBalance(reserves.reserve1)} B3TR
                </div>
                <div className="pl-2">
                  • {formatBalance(reserves.reserve0)} USDGLO
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Percentage Selection */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700">
            Amount to Remove
          </div>

          {/* Percentage Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePercentageChange(pct)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  percentage === pct
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Custom Percentage Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={percentage}
              onChange={(e) => handlePercentageChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className="font-medium">{percentage.toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Direct LP Amount Input */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                LP Tokens to Remove
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">LP</span>
                </div>
                <span className="font-medium">LP</span>
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={lpAmountToRemove}
                onChange={(e) => handleLpAmountChange(e.target.value)}
                className="flex-1 text-right text-lg font-semibold bg-transparent border-none outline-none"
                step="any"
                max={formatBalance(currentLpBalance)}
              />
            </div>
          </div>
        </div>
        {/* Expected Output */}
        {expectedAmounts && lpAmountToRemove && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="text-sm font-medium text-blue-900">
              You will receive (estimated)
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={b3trToken.image || ""}
                    alt="B3TR"
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-sm font-medium">B3TR</span>
                </div>
                <span className="text-sm font-semibold">
                  {formatBalance(expectedAmounts.amount1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={gloToken.image || ""}
                    alt="USDGLO"
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-sm font-medium">USDGLO</span>
                </div>
                <span className="text-sm font-semibold">
                  {formatBalance(expectedAmounts.amount0)}
                </span>
              </div>
            </div>
            <div className="text-xs text-blue-700 pt-2 border-t border-blue-200">
              Removing {expectedAmounts.percentage.toFixed(4)}% of your
              liquidity position
            </div>
          </div>
        )}
        <button
          className={`py-3 px-6 rounded-lg font-medium mt-4 transition-colors ${
            lpAmountToRemove &&
            !reservesLoading &&
            !isRemovingLiquidity &&
            currentLpBalance > BigInt(0) &&
            displayAddress
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={handleRemoveLiquidity}
          disabled={
            !lpAmountToRemove ||
            reservesLoading ||
            isRemovingLiquidity ||
            currentLpBalance === BigInt(0) ||
            !displayAddress
          }
        >
          {reservesLoading
            ? "Loading..."
            : isRemovingLiquidity
            ? "Removing Liquidity..."
            : "Remove Liquidity"}
        </button>
        {currentLpBalance === BigInt(0) && (
          <div className="text-center text-gray-500 text-sm py-4">
            You don&apos;t have any LP tokens to remove
          </div>
        )}
      </section>
    </div>
  );
}
