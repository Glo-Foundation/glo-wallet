import { utils } from "ethers";
import { QRCodeSVG } from "qrcode.react";
import { useContext, useState } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useContract,
  useSigner,
} from "wagmi";

import UsdgloContract from "@/abi/usdglo.json";
import Balance from "@/components/Balance";
import CTA from "@/components/CTA";
import Header from "@/components/Header";
import Transactions from "@/components/Transactions";
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

export default function Home() {
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { data: balance, refetch } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_USDGLO as any,
  });
  console.log({ balance });
  const { disconnect } = useDisconnect();
  const { openModal, closeModal } = useContext(ModalContext);

  const transactions = [
    {
      from: "me",
      to: "glo",
      amount: "1.001",
    },
    {
      from: "me",
      to: "rad",
      amount: "3.52",
    },
  ];

  const buy = async () => {
    if (!torusPlugin.torusWalletInstance.isInitialized) {
      console.log("Torus not initialized yet");
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
      console.log("Torus not initialized yet");
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
    <div className="mt-4 px-2.5">
      <Header />
      <div className="flex flex-col space-y-10">
        <Balance
          isLoading={isLoading}
          isConnected={isConnected}
          balance={balance}
        />
        <Transactions transactions={transactions} />
        <CTA />
      </div>
    </div>
  );
}
