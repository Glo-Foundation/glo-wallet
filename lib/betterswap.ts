import { ethers } from "ethers";

import {
  B3TR,
  USDGLO,
  VECHAIN_B3TR_USDGLO_POOL,
  VECHAIN_ROUTER_ADDRESS,
} from "@/lib/config";
import { getJsonProvider } from "@/utils";

export const getVeChainTokenBalance = async (
  tokenAddress: string,
  walletAddress: string,
  chainId: number
): Promise<bigint> => {
  try {
    const provider = await getJsonProvider(chainId);
    const abi = ["function balanceOf(address account) view returns (uint256)"];
    const tokenContract = new ethers.Contract(tokenAddress, abi, provider);
    return await tokenContract.balanceOf(walletAddress);
  } catch (err) {
    console.log(
      `Could not fetch token balance for ${walletAddress} on chain ${chainId}`
    );
    console.log(err);
    return BigInt(0);
  }
};

export const getVeChainLiquidityPoolInfo = async (
  poolAddress: string,
  chainId: number
): Promise<{
  token0: string;
  token1: string;
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
}> => {
  try {
    const provider = await getJsonProvider(chainId);
    const abi = [
      "function token0() view returns (address)",
      "function token1() view returns (address)",
      "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
      "function totalSupply() view returns (uint256)",
    ];
    const poolContract = new ethers.Contract(poolAddress, abi, provider);

    const [token0, token1, reserves, totalSupply] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.getReserves(),
      poolContract.totalSupply(),
    ]);

    return {
      token0,
      token1,
      reserve0: BigInt(reserves._reserve0),
      reserve1: BigInt(reserves._reserve1),
      totalSupply: BigInt(totalSupply),
    };
  } catch (err) {
    console.log(
      `Could not fetch pool info for ${poolAddress} on chain ${chainId}`
    );
    console.log(err);
    return {
      token0: "",
      token1: "",
      reserve0: BigInt(0),
      reserve1: BigInt(0),
      totalSupply: BigInt(0),
    };
  }
};

export const getPairReserves = async (
  pairAddress: string,
  chainId: number
): Promise<{
  reserve0: bigint;
  reserve1: bigint;
  blockTimestampLast: number;
}> => {
  try {
    const provider = await getJsonProvider(chainId);
    const abi = [
      "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
    ];
    const pairContract = new ethers.Contract(pairAddress, abi, provider);

    const reserves = await pairContract.getReserves();

    return {
      reserve0: BigInt(reserves._reserve0),
      reserve1: BigInt(reserves._reserve1),
      blockTimestampLast: Number(reserves._blockTimestampLast),
    };
  } catch (err) {
    console.log(
      `Could not fetch reserves for pair ${pairAddress} on chain ${chainId}`
    );
    console.log(err);
    return {
      reserve0: BigInt(0),
      reserve1: BigInt(0),
      blockTimestampLast: 0,
    };
  }
};

export const getQuoteFromRouter = async (
  routerAddress: string,
  amountA: bigint,
  reserveA: bigint,
  reserveB: bigint,
  chainId: number
): Promise<bigint> => {
  try {
    const provider = await getJsonProvider(chainId);
    const abi = [
      "function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) pure returns (uint256 amountB)",
    ];
    const routerContract = new ethers.Contract(routerAddress, abi, provider);

    const amountB = await routerContract.quote(amountA, reserveA, reserveB);
    return BigInt(amountB);
  } catch (err) {
    console.log(
      `Could not get quote from router ${routerAddress} on chain ${chainId}`
    );
    console.log(err);
    return BigInt(0);
  }
};

// Pure calculation function (client-side calculation without contract call)
export const calculateQuote = (
  amountA: bigint,
  reserveA: bigint,
  reserveB: bigint
): bigint => {
  if (reserveA === BigInt(0)) {
    return BigInt(0);
  }
  return (amountA * reserveB) / reserveA;
};

export const calculateLiquidityTokensToMint = (
  amountA: bigint,
  amountB: bigint,
  reserveA: bigint,
  reserveB: bigint,
  totalSupply: bigint
): bigint => {
  if (totalSupply === BigInt(0)) {
    // Initial liquidity - geometric mean minus minimum liquidity
    const liquidity = (amountA * amountB) ** BigInt(1 / 2) - BigInt(1000);
    return liquidity > BigInt(0) ? liquidity : BigInt(0);
  } else {
    // Subsequent liquidity - minimum of proportional amounts
    const liquidityA = (amountA * totalSupply) / reserveA;
    const liquidityB = (amountB * totalSupply) / reserveB;
    return liquidityA < liquidityB ? liquidityA : liquidityB;
  }
};

export const calculateTokensFromLiquidity = (
  liquidity: bigint,
  totalSupply: bigint,
  reserveA: bigint,
  reserveB: bigint
): { amountA: bigint; amountB: bigint } => {
  const amountA = (liquidity * reserveA) / totalSupply;
  const amountB = (liquidity * reserveB) / totalSupply;
  return { amountA, amountB };
};

// Helper function to format units (similar to ethers formatUnits)
const formatUnits = (value: bigint, decimals = 18): string => {
  return (Number(value) / Math.pow(10, decimals)).toFixed(4);
};

export const addVeChainLiquidity = async (
  connex: any,
  tokenA: string,
  tokenB: string,
  amountADesired: bigint,
  amountBDesired: bigint,
  userAddress: string,
  slippageTolerance = 0.5 // 0.5% default slippage
): Promise<any> => {
  try {
    // Calculate minimum amounts with slippage tolerance
    const slippageMultiplier = (100 - slippageTolerance) / 100;
    const amountAMin = BigInt(
      Math.floor(Number(amountADesired) * slippageMultiplier)
    );
    const amountBMin = BigInt(
      Math.floor(Number(amountBDesired) * slippageMultiplier)
    );

    // Set deadline to 20 minutes from now
    const deadline = Math.floor(Date.now() / 1000) + 1200;

    // addLiquidity ABI
    const addLiquidityABI = {
      inputs: [
        { internalType: "address", name: "tokenA", type: "address" },
        { internalType: "address", name: "tokenB", type: "address" },
        { internalType: "uint256", name: "amountADesired", type: "uint256" },
        { internalType: "uint256", name: "amountBDesired", type: "uint256" },
        { internalType: "uint256", name: "amountAMin", type: "uint256" },
        { internalType: "uint256", name: "amountBMin", type: "uint256" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "deadline", type: "uint256" },
      ],
      name: "addLiquidity",
      outputs: [
        { internalType: "uint256", name: "amountA", type: "uint256" },
        { internalType: "uint256", name: "amountB", type: "uint256" },
        { internalType: "uint256", name: "liquidity", type: "uint256" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    };

    // Approve ABI for token approvals
    const approveABI = {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    };

    // Prepare approval clauses for both tokens
    const tokenAContract = connex.thor.account(tokenA).method(approveABI);
    const tokenBContract = connex.thor.account(tokenB).method(approveABI);
    const routerContract = connex.thor
      .account(VECHAIN_ROUTER_ADDRESS)
      .method(addLiquidityABI);

    const tokenAApprovalClause = tokenAContract.asClause(
      VECHAIN_ROUTER_ADDRESS,
      amountADesired.toString()
    );
    const tokenBApprovalClause = tokenBContract.asClause(
      VECHAIN_ROUTER_ADDRESS,
      amountBDesired.toString()
    );

    // Prepare addLiquidity clause
    const addLiquidityClause = routerContract.asClause(
      tokenA,
      tokenB,
      amountADesired.toString(),
      amountBDesired.toString(),
      amountAMin.toString(),
      amountBMin.toString(),
      userAddress,
      deadline.toString()
    );

    // Create transaction with all clauses
    const clauses = [
      {
        comment: `Approve ${formatUnits(amountADesired, 18)} ${
          tokenA === B3TR ? "B3TR" : "Token A"
        }`,
        ...tokenAApprovalClause,
      },
      {
        comment: `Approve ${formatUnits(amountBDesired, 18)} ${
          tokenB === USDGLO ? "USDGLO" : "Token B"
        }`,
        ...tokenBApprovalClause,
      },
      {
        comment: `Add liquidity: ${formatUnits(
          amountADesired,
          18
        )} + ${formatUnits(amountBDesired, 18)}`,
        ...addLiquidityClause,
      },
    ];

    console.log("Sending liquidity transaction with clauses:", clauses);

    // Send transaction
    const result = await connex.vendor
      .sign("tx", clauses)
      .signer(userAddress)
      .gas(500000) // Set maximum gas for liquidity operations
      .comment(
        `Add liquidity: ${formatUnits(amountADesired, 18)} ${
          tokenA === B3TR ? "B3TR" : "TokenA"
        } + ${formatUnits(amountBDesired, 18)} ${
          tokenB === USDGLO ? "USDGLO" : "TokenB"
        }`
      )
      .request();

    console.log("Liquidity transaction result:", result);
    return result;
  } catch (error) {
    console.error("Error adding VeChain liquidity:", error);
    throw error;
  }
};

// Get LP token total supply
export const getLPTokenTotalSupply = async (
  lpTokenAddress: string,
  chainId: number
): Promise<bigint> => {
  try {
    const provider = await getJsonProvider(chainId);
    const abi = ["function totalSupply() view returns (uint256)"];
    const lpContract = new ethers.Contract(lpTokenAddress, abi, provider);

    const totalSupply = await lpContract.totalSupply();
    return BigInt(totalSupply);
  } catch (err) {
    console.log(
      `Could not fetch LP token total supply for ${lpTokenAddress} on chain ${chainId}`
    );
    console.log(err);
    return BigInt(0);
  }
};

// Calculate tokens to receive when removing liquidity
export const calculateRemoveLiquidityAmounts = (
  lpTokenAmount: bigint,
  totalSupply: bigint,
  reserve0: bigint,
  reserve1: bigint
): { amount0: bigint; amount1: bigint; percentage: number } => {
  if (totalSupply === BigInt(0)) {
    return { amount0: BigInt(0), amount1: BigInt(0), percentage: 0 };
  }

  const amount0 = (lpTokenAmount * reserve0) / totalSupply;
  const amount1 = (lpTokenAmount * reserve1) / totalSupply;
  const percentage =
    Number((lpTokenAmount * BigInt(10000)) / totalSupply) / 100;

  return { amount0, amount1, percentage };
};

export const removeVeChainLiquidity = async (
  connex: any,
  tokenA: string,
  tokenB: string,
  liquidity: bigint,
  userAddress: string,
  slippageTolerance = 0.5 // 0.5% default slippage
): Promise<any> => {
  try {
    // Calculate minimum amounts with slippage tolerance
    const slippageMultiplier = (100 - slippageTolerance) / 100;

    // For remove liquidity, we need to calculate expected amounts first
    // This would typically require knowing the current reserves and total supply
    // For now, we'll set minimum amounts to 0 (can be improved)
    const amountAMin = BigInt(0); // Should be calculated based on expected amounts
    const amountBMin = BigInt(0); // Should be calculated based on expected amounts

    // Set deadline to 20 minutes from now
    const deadline = Math.floor(Date.now() / 1000) + 1200;

    // removeLiquidity ABI
    const removeLiquidityABI = {
      inputs: [
        { internalType: "address", name: "tokenA", type: "address" },
        { internalType: "address", name: "tokenB", type: "address" },
        { internalType: "uint256", name: "liquidity", type: "uint256" },
        { internalType: "uint256", name: "amountAMin", type: "uint256" },
        { internalType: "uint256", name: "amountBMin", type: "uint256" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "deadline", type: "uint256" },
      ],
      name: "removeLiquidity",
      outputs: [
        { internalType: "uint256", name: "amountA", type: "uint256" },
        { internalType: "uint256", name: "amountB", type: "uint256" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    };

    // Approve ABI for LP token approval
    const approveABI = {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    };

    // Prepare approval clause for LP token
    const lpTokenContract = connex.thor
      .account(VECHAIN_B3TR_USDGLO_POOL)
      .method(approveABI);
    const routerContract = connex.thor
      .account(VECHAIN_ROUTER_ADDRESS)
      .method(removeLiquidityABI);

    const lpTokenApprovalClause = lpTokenContract.asClause(
      VECHAIN_ROUTER_ADDRESS,
      liquidity.toString()
    );

    // Prepare removeLiquidity clause
    const removeLiquidityClause = routerContract.asClause(
      tokenA,
      tokenB,
      liquidity.toString(),
      amountAMin.toString(),
      amountBMin.toString(),
      userAddress,
      deadline.toString()
    );

    // Create transaction with all clauses
    const clauses = [
      {
        comment: `Approve ${formatUnits(liquidity, 18)} LP tokens`,
        ...lpTokenApprovalClause,
      },
      {
        comment: `Remove liquidity: ${formatUnits(liquidity, 18)} LP tokens`,
        ...removeLiquidityClause,
      },
    ];

    console.log("Sending remove liquidity transaction with clauses:", clauses);

    // Send transaction
    const result = await connex.vendor
      .sign("tx", clauses)
      .signer(userAddress)
      .gas(300000) // Set maximum gas for remove liquidity operations
      .comment(`Remove liquidity: ${formatUnits(liquidity, 18)} LP tokens`)
      .request();

    console.log("Remove liquidity transaction result:", result);
    return result;
  } catch (error) {
    console.error("Error removing VeChain liquidity:", error);
    throw error;
  }
};
