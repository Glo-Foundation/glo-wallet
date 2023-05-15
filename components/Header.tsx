import Image from "next/image";
import { useConnect, useDisconnect } from "wagmi";

type Props = {
  address: string;
  connectors: any[];
  isConnected: boolean;
};
export default function Header({ address, isConnected }: Props) {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();
  return (
    <nav className="mb-9 mt-6 flex justify-between">
      <a href="https://glodollar.org/">
        <Image src="/glo-logo-text.svg" alt="glo logo" width={74} height={26} />
      </a>
      {isConnected ? (
        <>
          <button onClick={() => disconnect()}>[Disconnect]</button>
          <div>
            {address?.slice(0, 5)}...
            {address?.slice(-3)}
          </div>
        </>
      ) : (
        <button onClick={() => connect({ connector: connectors[0] })}>
          [Connect]
        </button>
      )}
    </nav>
  );
}
