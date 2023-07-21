import { mainnet, goerli, polygon, polygonMumbai } from "@wagmi/core/chains";

export const chainConfig: { [id: number]: `0x${string}` } = {
  // Mainnets
  [polygon.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [mainnet.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  // Testnets
  [polygonMumbai.id]: "0xbd05d3B38c400d95D52c2B8fF124DF511AB7EBfc",
  [goerli.id]: "0x2c872de03E91D2ee463308Cb5dA4Ed9e41bBB355",
};

const defaultChainId = polygon.id;

export const getSmartContractAddress = (chainId?: number) =>
  chainConfig[chainId || defaultChainId];

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
  "UA", // Ukraine
  "VE", // Venezuela
  "YE", // Yemen
  "ZW", // Zimbabwe
];

const chainRPCUrl: { [id: number]: string } = {
  // Mainnets
  [polygon.id]: process.env.NEXT_PUBLIC_POLYGON_RPC_URL as string,
  [mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_RPC_URL as string,
  // Testnets
  [polygonMumbai.id]: process.env.NEXT_PUBLIC_MUMBAI_RPC_URL as string,
  [goerli.id]: process.env.NEXT_PUBLIC_GOERLI_RPC_URL as string,
};

export const getChainRPCUrl = (chainId?: number) => {
  return chainRPCUrl[chainId || defaultChainId];
};

const firstGloBlock: { [id: number]: number } = {
  // Mainnets
  [polygon.id]: 35063113,
  [mainnet.id]: 15874664,
  // Testnets
  [polygonMumbai.id]: 35142419,
  [goerli.id]: 7878164,
};

export const getFirstGloBlock = (chainId?: number) => {
  return firstGloBlock[chainId || defaultChainId];
};

export const supportedChains = {
  mainnet: [polygon.id, mainnet.id],
  testnet: [polygonMumbai.id, goerli.id],
};

export const getChainExplorerUrl = (chainId?: number) => {
  switch (chainId) {
    case polygon.id:
      return "https://polygonscan.com";
    case polygonMumbai.id:
      return "https://mumbai.polygonscan.com";
    case goerli.id:
      return "https://goerli.etherscan.io";
    case mainnet.id:
    default:
      return "https://etherscan.io";
  }
};
