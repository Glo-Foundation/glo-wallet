import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  celo,
  celoAlfajores,
  goerli,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  vechain,
} from "viem/chains";

import { isProd } from "./utils";

export const VECHAIN_TESTNET = {
  id: -1,
  name: "vechain_testnet",
  network: "homestead",
  nativeCurrency: {
    name: "VeChainThor",
    symbol: "VET",
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ["https://node-testnet.vechain.energy"],
    },
    default: {
      http: ["https://node-testnet.vechain.energy"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explore-testnet.vechain.org" },
  },
};

export const chainConfig: { [id: number]: `0x${string}` } = {
  // Mainnets
  [polygon.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [mainnet.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [celo.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [optimism.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [base.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [arbitrum.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [vechain.id]: "0x29c630cce4ddb23900f5fe66ab55e488c15b9f5e",
  // Testnets
  [arbitrumSepolia.id]: "0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1", // this is actually USDC
  [optimismSepolia.id]: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7", // this is actually USDC
  [baseSepolia.id]: "0x036cbd53842c5426634e7929541ec2318f3dcf7e", // this is actually USDC
  [polygonMumbai.id]: "0xbd05d3B38c400d95D52c2B8fF124DF511AB7EBfc",
  [goerli.id]: "0x2c872de03E91D2ee463308Cb5dA4Ed9e41bBB355",
  [celoAlfajores.id]: "0x6054aC9c220070F8c3093730d64E701ad23077C5",
  [VECHAIN_TESTNET.id]: "0x89FD13624F64aaF03D1ff25ff5ce617cde65ee69",
};

export const defaultChain = () => (isProd() ? optimism : optimismSepolia);
export const defaultChainId = () => defaultChain().id;

export const getSmartContractAddress = (chainId?: number) =>
  chainConfig[chainId || defaultChainId()];

// https://en.wikipedia.org/wiki/ISO_3166-1
export const PROHIBITED_COUNTRIES = [
  "BY", // Belarus
  "BA", // Bosnia And Herzegovina
  "BI", // Burundi
  "CF", // Central African Republic
  "CD", // Congo, The Democratic Republic Of The
  "CU", // Cuba
  "IR", // Iran, Islamic Republic Of
  "IQ", // Iraq
  "KP", // Korea, Democratic People's Republic Of
  "XK", // Kosovo
  "LB", // Lebanon
  "LY", // Libya
  "MK", // Macedonia
  "NI", // Nicaragua
  "RU", // Russian Federation
  "SO", // Somalia
  "SS", // South Sudan
  "SD", // Sudan
  "SY", // Syrian Arab Republic
  "VE", // Venezuela
  "YE", // Yemen
  "ZW", // Zimbabwe
];

// Geo loc demo: https://edge-functions-geolocation.vercel.sh/

// https://en.wikipedia.org/wiki/ISO_3166-2:UA
export const PROHIBITED_REGIONS = [
  "UA-40", // Sevastopol
  "UA-43", // Avtonomna Respublika Krym
  "UA-14", // Donetska oblast
  "UA-09", // Luhanska oblast
];

const chainRPCUrl: { [id: number]: string } = {
  // Mainnets
  [polygon.id]: process.env.NEXT_PUBLIC_POLYGON_RPC_URL as string,
  [mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_RPC_URL as string,
  [celo.id]:
    process.env.CELO_RPC_URL ||
    (process.env.NEXT_PUBLIC_CELO_RPC_URL as string),
  [optimism.id]: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL as string,
  [arbitrum.id]: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL as string,
  [base.id]: process.env.NEXT_PUBLIC_BASE_RPC_URL as string,
  [vechain.id]: process.env.NEXT_PUBLIC_VECHAIN_RPC_URL as string,
  // Testnets
  [polygonMumbai.id]: process.env.NEXT_PUBLIC_MUMBAI_RPC_URL as string,
  [goerli.id]: process.env.NEXT_PUBLIC_GOERLI_RPC_URL as string,
  [celoAlfajores.id]: process.env.NEXT_PUBLIC_ALFAJORES_RPC_URL as string,
  [optimismSepolia.id]: process.env
    .NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC_URL as string,
  [arbitrumSepolia.id]: process.env
    .NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL as string,
  [baseSepolia.id]: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL as string,
};

export const getChainRPCUrl = (chainId?: number) => {
  return chainRPCUrl[chainId || defaultChainId()];
};

const firstGloBlock: { [id: number]: number } = {
  // Mainnets
  [polygon.id]: 35063113,
  [mainnet.id]: 15874664,
  [celo.id]: 20910330,
  // Testnets
  [polygonMumbai.id]: 35142419,
  [goerli.id]: 7878164,
  [celoAlfajores.id]: 19212753,
};

export const getFirstGloBlock = (chainId?: number) => {
  return firstGloBlock[chainId || defaultChainId()];
};

export const supportedChains = {
  mainnet: [polygon.id, mainnet.id, celo.id],
  testnet: [polygonMumbai.id, goerli.id, celoAlfajores.id],
};

// BetterSwap
export const BETTER_VET = "0xf9b02b47694fd635A413F16dC7B38aF06Cc16fe5";
export const B3TR = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699";
export const USDGLO = chainConfig[vechain.id];
export const VECHAIN_B3TR_USDGLO_POOL =
  "0x654502E86BcD153f074Fe534C817EB62fc7EF4C1";
export const token0 = USDGLO;
export const token1 = B3TR;

// VeChain Router Contract Address (replace with actual router address)
export const VECHAIN_ROUTER_ADDRESS =
  "0x349Ede93B675c0F0f8d7CdaD74eCF1419943E6ac"; // Replace with actual router address
