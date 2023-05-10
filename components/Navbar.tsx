import { ModalContext } from "@/lib/context";
import { torusPlugin } from "@/lib/web3uath";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useContext } from "react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";

export default function Navbar() {
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { data: balance, refetch } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_USDGLO as any,
  });
  const { disconnect } = useDisconnect();

  const openModal = useContext(ModalContext);

  const buy = async () => {
    if (!torusPlugin.torusWalletInstance.isInitialized) {
      console.log("Torus not initialzied yet");
      return;
    }

    await torusPlugin.initiateTopup("moonpay", {
      selectedAddress: "wallet_address",
      selectedCurrency: "USD", // Fiat currency
      fiatValue: 100, // Fiat Value
      selectedCryptoCurrency: "ETH", // Cryptocurreny `SOL`, `MATIC` etc.
      chainNetwork: "mainnet", // Blockchain network
    });
  };

  const scan = async () => {
    if (!torusPlugin.torusWalletInstance.isInitialized) {
      console.log("Torus not initialzied yet");
      return;
    }

    await torusPlugin.showWalletConnectScanner();
  };

  const receive = async () => {
    openModal(
      <div>
        <QRCodeSVG value={address as string} />
        {address}
      </div>
    );
  };

  const transfer = async () => {
    openModal(
      <div>
        <input value={"0x..."} />
        <button>send</button>
      </div>
    );
  };

  return (
    <nav className="mb-9">
      <a href="https://glodollar.org/">
        <Image src="/glo-logo.svg" alt="glo logo" width={74} height={26} />
      </a>
      {isLoading ? (
        "Loading..."
      ) : isConnected ? (
        <div className="flex flex-col">
          <button onClick={() => disconnect()}>[Disconnect]</button>
          <div>
            {address?.slice(0, 5)}...
            {address?.slice(-3)}
          </div>
          <div>
            {balance?.formatted} {balance?.symbol}
          </div>
          <button onClick={() => buy()}>[Buy Glo]</button>
          <button onClick={() => transfer()}>[Transfer]</button>
          <button onClick={() => scan()}>[Scan]</button>
          <button onClick={() => receive()}>[Receive]</button>
        </div>
      ) : (
        <button onClick={() => connect({ connector: connectors[0] })}>
          [Connect]
        </button>
      )}
    </nav>
  );
}
