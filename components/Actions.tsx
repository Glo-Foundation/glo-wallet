import { QRCodeSVG } from "qrcode.react";
import { useContext, useState } from "react";
import { useSigner, useContract } from "wagmi";

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
  const { openModal, closeModal } = useContext(ModalContext);
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
    <nav className="mb-9">
      <div className="flex flex-col">
        <button onClick={() => buy()}>[Buy Glo]</button>
        <button onClick={() => transfer()}>[Transfer]</button>
        <button onClick={() => scan()}>[Scan]</button>
        <button onClick={() => receive()}>[Receive]</button>
      </div>
    </nav>
  );
}
