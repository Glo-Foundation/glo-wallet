import { mainnet, goerli, polygon, polygonMumbai } from "@wagmi/core/chains";

export const chainConfig: { [id: number]: `0x${string}` } = {
  // Mainnets
  [polygon.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  [mainnet.id]: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
  // Testnets
  [polygonMumbai.id]: "0xbd05d3B38c400d95D52c2B8fF124DF511AB7EBfc",
  [goerli.id]: "0x2c872de03E91D2ee463308Cb5dA4Ed9e41bBB355",
};

const defaultChainId = polygonMumbai.id;

export const getSmartContractAddress = (chainId?: number) =>
  chainConfig[chainId || defaultChainId];

const chainRPCUrl: { [id: number]: string } = {
  // Mainnets
  [polygon.id]: process.env.POLYGON_RPC_URL!,
  [mainnet.id]: process.env.MAINNET_RPC_URL!,
  // Testnets
  [polygonMumbai.id]: process.env.MUMBAI_RPC_URL!,
  [goerli.id]: process.env.GOERLI_RPC_URL!,
};

export const getChainRPCUrl = (chainId?: number) => {
  return chainRPCUrl[chainId || defaultChainId];
};
