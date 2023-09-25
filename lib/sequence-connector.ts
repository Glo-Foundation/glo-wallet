// https://github.com/0xsequence/wagmi-connector

import { sequence } from "0xsequence";
import Cookies from "js-cookie";
import { createWalletClient, custom, UserRejectedRequestError } from "viem";
import { Connector, ConnectorData, Chain } from "wagmi";

interface Options {
  defaultNetwork?: sequence.network.ChainIdLike;
  connect?: sequence.provider.ConnectOptions & { walletAppURL?: string };
}

export class GloSequenceConnector extends Connector<
  sequence.provider.SequenceProvider,
  Options | undefined
> {
  id = "sequence";
  name = "Sequence";

  ready = true;

  provider: sequence.provider.SequenceProvider;

  constructor({ chains, options }: { chains?: Chain[]; options?: Options }) {
    super({ chains, options });

    this.provider = sequence.initWallet({
      defaultNetwork: options?.defaultNetwork,
      transports: {
        walletAppURL: options?.connect?.walletAppURL,
      },
      defaultEIP6492: true,
    });

    this.provider.on("chainChanged", (chainIdHex: string) => {
      this?.emit("change", {
        chain: { id: normalizeChainId(chainIdHex), unsupported: false },
      });
    });

    this.provider.on("accountsChanged", (accounts: string[]) => {
      // this?.emit("accountsChanged", this.onAccountsChanged(accounts));
    });

    this.provider.on("disconnect", () => {
      this.onDisconnect();
    });
  }

  async connect(): Promise<Required<ConnectorData>> {
    if (!this.provider.isConnected()) {
      this?.emit("message", { type: "connecting" });
      const e = await this.provider.connect(
        this.options?.connect ?? { app: "RainbowKit app" }
      );
      Cookies.set("glo-email", e.email || "");

      if (e.error) {
        throw new UserRejectedRequestError(new Error(e.error));
      }
      if (!e.connected) {
        throw new UserRejectedRequestError(
          new Error("Wallet connection rejected")
        );
      }
    }

    const account = await this.getAccount();

    return {
      account,
      chain: {
        id: this.provider.getChainId(),
        unsupported: this.isChainUnsupported(this.provider.getChainId()),
      },
    };
  }

  async getWalletClient({ chainId }: { chainId?: number } = {}): Promise<any> {
    const chain = this.chains.find((x) => x.id === chainId);

    return createWalletClient({
      chain,
      account: await this.getAccount(),
      transport: custom(this.provider),
    });
  }

  protected onChainChanged(chain: string | number): void {
    this.provider.setDefaultChainId(normalizeChainId(chain));
  }

  async switchChain(chainId: number): Promise<Chain> {
    if (this.isChainUnsupported(chainId)) {
      throw new Error("Unsupported chain");
    }

    this.provider.setDefaultChainId(chainId);
    return this.chains.find((x) => x.id === chainId) as Chain;
  }

  async disconnect() {
    this.provider.disconnect();
  }

  getAccount() {
    return this.provider.getSigner().getAddress() as Promise<`0x${string}`>;
  }

  async getChainId() {
    return this.provider.getChainId();
  }

  async getProvider() {
    return this.provider;
  }

  async getSigner() {
    return this.provider.getSigner();
  }

  async isAuthorized() {
    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  protected onAccountsChanged = (accounts: string[]) => {
    return { account: accounts[0] };
  };

  protected onDisconnect = () => {
    this?.emit("disconnect");
  };

  isChainUnsupported(chainId: number): boolean {
    return (
      this.provider.networks.findIndex((x) => x.chainId === chainId) === -1
    );
  }
}

function normalizeChainId(
  chainId: string | number | bigint | { chainId: string }
) {
  if (typeof chainId === "object") return normalizeChainId(chainId.chainId);
  if (typeof chainId === "string")
    return Number.parseInt(
      chainId,
      chainId.trim().substring(0, 2) === "0x" ? 16 : 10
    );
  if (typeof chainId === "bigint") return Number(chainId);
  return chainId;
}
