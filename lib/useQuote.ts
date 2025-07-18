import { useQuery } from "@tanstack/react-query";
import { vechain } from "viem/chains";
import { useAccount } from "wagmi";

import { calculateQuote, getQuoteFromRouter } from "@/utils";

export interface UseQuoteParameters {
  amountA?: bigint;
  reserveA?: bigint;
  reserveB?: bigint;
  routerAddress?: string; // Optional - if provided, uses contract call
  chainId?: number;
  enabled?: boolean;
  gcTime?: number;
  staleTime?: number;
  refetchInterval?: number;
  useClientSide?: boolean; // If true, uses client-side calculation instead of contract
}

export interface QuoteData {
  amountB: bigint;
  formatted: string;
  price: number; // Price ratio (amountB/amountA)
  inversePrice: number; // Inverse price ratio (amountA/amountB)
}

export interface UseQuoteReturnType {
  data: QuoteData | undefined;
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  refetch: () => void;
}

const formatAmount = (amount: bigint, decimals = 18): string => {
  return (Number(amount) / Math.pow(10, decimals)).toFixed(6);
};

const calculatePrice = (amountA: bigint, amountB: bigint): number => {
  if (amountA === BigInt(0)) return 0;
  return Number(amountB) / Number(amountA);
};

export function useQuote({
  amountA,
  reserveA,
  reserveB,
  routerAddress,
  chainId,
  enabled = true,
  gcTime = 10_000, // 10 seconds cache time (shorter since quotes change frequently)
  staleTime = 2_000, // 2 seconds stale time
  refetchInterval,
  useClientSide = true, // Default to client-side calculation for speed
}: UseQuoteParameters = {}): UseQuoteReturnType {
  const { chain } = useAccount();

  // Use provided chainId or fall back to connected chain
  const targetChainId = chainId || chain?.id || vechain.id;

  const queryKey = [
    "quote",
    amountA?.toString(),
    reserveA?.toString(),
    reserveB?.toString(),
    routerAddress,
    targetChainId,
    useClientSide,
  ];

  const { data, error, isError, isLoading, isSuccess, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<QuoteData> => {
      if (!amountA || !reserveA || !reserveB) {
        throw new Error("Amount A, Reserve A, and Reserve B are required");
      }

      let amountB: bigint;

      if (useClientSide || !routerAddress) {
        // Use client-side calculation (faster, no network call)
        amountB = calculateQuote(amountA, reserveA, reserveB);
      } else {
        // Use contract call for exact router calculation
        amountB = await getQuoteFromRouter(
          routerAddress,
          amountA,
          reserveA,
          reserveB,
          targetChainId
        );
      }

      const price = calculatePrice(amountA, amountB);
      const inversePrice = price > 0 ? 1 / price : 0;

      return {
        amountB,
        formatted: formatAmount(amountB),
        price,
        inversePrice,
      };
    },
    enabled: Boolean(
      amountA &&
        reserveA &&
        reserveB &&
        amountA > BigInt(0) &&
        reserveA > BigInt(0) &&
        reserveB > BigInt(0) &&
        enabled
    ),
    gcTime,
    staleTime,
    refetchInterval,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000),
  });

  return {
    data,
    error,
    isError,
    isLoading,
    isSuccess,
    refetch,
  };
}
