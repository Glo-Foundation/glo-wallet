// TODO: TO delete?
// import { sequence } from "0xsequence";
// import { mainnetNetworks, testnetNetworks } from "@0xsequence/network";
// import { Wallet } from "@0xsequence/provider";
// import Cookies from "js-cookie";
// import { createWalletClient, custom, UserRejectedRequestError } from "viem";
// import {
//   Connector,
//   ConnectorData,
//   Chain,
//   ConnectorNotFoundError,
//   Address,
// } from "wagmi";

// import type { ConnectOptions, Web3Provider } from "@0xsequence/provider";
// import type { WalletClient } from "wagmi";

// interface Options {
//   connect?: ConnectOptions;
// }

// export class GloSequenceConnector extends Connector<
//   Web3Provider,
//   Options | undefined
// > {
//   id = "sequence";
//   name = "Sequence";
//   ready = true;
//   provider: Web3Provider | null = null;
//   wallet: Wallet | null = null;
//   connected = false;
//   constructor({ chains, options }: { chains?: Chain[]; options?: Options }) {
//     super({ chains, options });
//   }
//   async connect(): Promise<Required<ConnectorData>> {
//     if (!this.wallet) {
//       this.wallet = await sequence.initWallet();
//     }
//     if (!this.wallet.isConnected()) {
//       this?.emit("message", { type: "connecting" });
//       const e = await this.wallet.connect(this.options?.connect);

//       Cookies.set("glo-email", e.email || "");

//       if (e.error) {
//         throw new UserRejectedRequestError(new Error(e.error));
//       }
//       if (!e.connected) {
//         throw new UserRejectedRequestError(
//           new Error("Wallet connection rejected")
//         );
//       }
//     }

//     const chainId = await this.getChainId();
//     const provider = await this.getProvider();
//     const account = (await this.getAccount()) as Address;
//     provider.on("accountsChanged", this.onAccountsChanged);
//     this.wallet.on("chainChanged", this.onChainChanged);
//     provider.on("disconnect", this.onDisconnect);
//     this.connected = true;
//     return {
//       account,
//       chain: {
//         id: chainId,
//         unsupported: this.isChainUnsupported(chainId),
//       },
//     };
//   }

//   async getWalletClient({
//     chainId,
//   }: { chainId?: number } = {}): Promise<WalletClient> {
//     const [provider, account] = await Promise.all([
//       this.getProvider(),
//       this.getAccount(),
//     ]);
//     const chain = this.chains.find((x) => x.id === chainId) as Chain;
//     if (!provider) throw new Error("provider is required.");
//     return createWalletClient({
//       account,
//       chain,
//       transport: custom(provider),
//     });
//   }

//   async disconnect() {
//     if (!this.wallet) {
//       this.wallet = await sequence.initWallet();
//     }
//     this.wallet.disconnect();
//   }
//   async getAccount() {
//     if (!this.wallet) {
//       this.wallet = await sequence.initWallet();
//     }
//     return this.wallet.getAddress() as Promise<Address>;
//   }
//   async getChainId() {
//     if (!this.wallet) {
//       this.wallet = await sequence.initWallet();
//     }
//     if (!this.wallet.isConnected()) {
//       return this.connect().then(() => this.wallet!.getChainId());
//     }
//     return this.wallet.getChainId();
//   }
//   async getProvider() {
//     if (!this.wallet) {
//       this.wallet = await sequence.initWallet();
//     }
//     if (!this.provider) {
//       const provider = this.wallet.getProvider();
//       if (!provider) {
//         throw new ConnectorNotFoundError(
//           "Failed to get Sequence Wallet provider."
//         );
//       }
//       this.provider = provider;
//     }
//     return this.provider;
//   }
//   async getSigner() {
//     if (!this.wallet) {
//       this.wallet = await sequence.initWallet();
//     }
//     return this.wallet.getSigner();
//   }
//   async isAuthorized() {
//     try {
//       const account = await this.getAccount();
//       return !!account;
//     } catch {
//       return false;
//     }
//   }
//   async switchChain(chainId: number): Promise<Chain> {
//     await this.provider?.send("wallet_switchEthereumChain", [{ chainId }]);
//     return { id: chainId } as Chain;
//   }
//   protected onAccountsChanged = (accounts: string[]) => {
//     return { account: accounts[0] };
//   };
//   protected onChainChanged = (chain: number | string) => {
//     this.provider?.emit("chainChanged", chain);
//     const id = normalizeChainId(chain);
//     const unsupported = this.isChainUnsupported(id);
//     this?.emit("change", { chain: { id, unsupported } });
//   };
//   protected onDisconnect = () => {
//     this?.emit("disconnect");
//   };
//   isChainUnsupported(chainId: number): boolean {
//     return !(
//       mainnetNetworks.some((c) => c.chainId === chainId) ||
//       testnetNetworks.some((c) => c.chainId === chainId)
//     );
//   }
// }

// function normalizeChainId(chainId: string | number | bigint) {
//   if (typeof chainId === "string")
//     return Number.parseInt(
//       chainId,
//       chainId.trim().substring(0, 2) === "0x" ? 16 : 10
//     );
//   if (typeof chainId === "bigint") return Number(chainId);
//   return chainId;
// }
