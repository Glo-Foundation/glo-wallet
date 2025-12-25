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
} from "viem/chains";

import { isProd } from "./utils";

export const chainConfig: { [id: number]: `0x${string}` } = {
  // Mainnets
  [polygon.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [mainnet.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [celo.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [optimism.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [base.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [arbitrum.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  // Testnets
  [arbitrumSepolia.id]: "0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1", // this is actually USDC
  [optimismSepolia.id]: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7", // this is actually USDC
  [baseSepolia.id]: "0x036cbd53842c5426634e7929541ec2318f3dcf7e", // this is actually USDC
  [polygonMumbai.id]: "0xbd05d3B38c400d95D52c2B8fF124DF511AB7EBfc",
  [goerli.id]: "0x2c872de03E91D2ee463308Cb5dA4Ed9e41bBB355",
  [celoAlfajores.id]: "0x6054aC9c220070F8c3093730d64E701ad23077C5",
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
