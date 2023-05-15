import { utils } from "ethers";
import { QRCodeSVG } from "qrcode.react";
import { useContext, useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useContract,
  useSigner,
} from "wagmi";

import UsdgloContract from "@/abi/usdglo.json";
import { ModalContext } from "@/lib/context";
import { torusPlugin } from "@/lib/web3uath";

const SendForm = ({ close }: { close: () => void }) => {
  const [sendForm, setSendForm] = useState({
    address: "0x...",
    amount: "0.1",
  });
  const [hash, setHash] = useState();

  const { data: signer, isError, isLoading } = useSigner();

  const contract = useContract({
    address: process.env.NEXT_PUBLIC_USDGLO!,
    abi: UsdgloContract,
    signerOrProvider: signer,
  });

  const send = async () => {
    const x = await contract?.transfer(
      sendForm.address,
      utils.parseEther(sendForm.amount)
    );
    setHash(x.hash);
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await send();
      }}
    >
      <input
        value={sendForm.address}
        onChange={(e) => setSendForm({ ...sendForm, address: e.target.value })}
      />
      <input
        value={sendForm.amount}
        onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
      />
      <button disabled={hash!}>send</button>
      {hash && <div>Sent with hash {hash}</div>}
    </form>
  );
};

export default function Actions() {
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { data: balance, refetch } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_USDGLO as any,
  });
  const { disconnect } = useDisconnect();

  const [transactions, setTransactions] = useState<Transfer[]>([]);

  const { openModal, closeModal } = useContext(ModalContext);

  useEffect(() => {
    if (address) {
      fetch(`/api/transactions/${address}`).then(async (res) => {
        const { transactions } = await res.json();
        setTransactions(transactions as Transfer[]);
      });
    }
  }, [address]);

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
    openModal(<SendForm close={closeModal} />);
  };

  return (
    <nav className="mb-9">
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
          {transactions.map((tx) => (
            <p key={tx.ts}>
              {tx.type} / {tx.value} / {tx.ts}
            </p>
          ))}
        </div>
      ) : (
        <button onClick={() => connect({ connector: connectors[0] })}>
          [Connect]
        </button>
      )}
    </nav>
  );
}
