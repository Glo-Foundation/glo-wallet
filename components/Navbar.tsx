import Image from "next/image";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";

export default function Navbar() {
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { data: balance, refetch } = useBalance({
    address,
  });
  const { disconnect } = useDisconnect();

  return (
    <nav className="mb-9">
      <a href="https://glodollar.org/">
        <Image src="/glo-logo.svg" alt="glo logo" width={74} height={26} />
      </a>
      {isConnected ? (
        <>
          <button onClick={() => disconnect}>[Disconnect]</button>
          <div>
            {address?.slice(0, 5)}...
            {address?.slice(-3)}
          </div>
          {balance?.formatted} {balance?.symbol}
          <div></div>
        </>
      ) : (
        <button onClick={() => connect({ connector: connectors[0] })}>
          [Connect]
        </button>
      )}
    </nav>
  );
}
