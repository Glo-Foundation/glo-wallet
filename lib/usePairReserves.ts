import { useQuery } from "@tanstack/react-query";
import { vechain } from "viem/chains";
import { useAccount } from "wagmi";

import { getPairReserves } from "@/utils";

export interface UsePairReservesParameters {
  pairAddress?: string;
  chainId?: number;
  enabled?: boolean;
  gcTime?: number;
  staleTime?: number;
  refetchInterval?: number;
}

export interface PairReservesData {
  reserve0: bigint;
  reserve1: bigint;
  blockTimestampLast: number;
  formatted: {
    reserve0: string;
    reserve1: string;
  };
}

export interface UsePairReservesReturnType {
  data: PairReservesData | undefined;
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  refetch: () => void;
}

const formatReserve = (reserve: bigint, decimals = 18): string => {
  return (Number(reserve) / Math.pow(10, decimals)).toFixed(6);
};

export function usePairReserves({
  pairAddress,
  chainId,
  enabled = true,
  gcTime = 30_000, // 30 seconds cache time
  staleTime = 5_000, // 5 seconds stale time
  refetchInterval,
}: UsePairReservesParameters = {}): UsePairReservesReturnType {
  const { chain } = useAccount();

  // Use provided chainId or fall back to connected chain
  const targetChainId = chainId || chain?.id || vechain.id;

  const queryKey = ["pairReserves", pairAddress, targetChainId];

  const { data, error, isError, isLoading, isSuccess, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<PairReservesData> => {
      if (!pairAddress) {
        throw new Error("Pair address is required");
      }

      const reserves = await getPairReserves(pairAddress, targetChainId);

      return {
        ...reserves,
        formatted: {
          reserve0: formatReserve(reserves.reserve0),
          reserve1: formatReserve(reserves.reserve1),
        },
      };
    },
    enabled: Boolean(pairAddress && enabled),
    gcTime,
    staleTime,
    refetchInterval,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
