import { utils } from "ethers";
import Image from "next/image";
import { useContext, useState } from "react";
import { useContract, useSigner } from "wagmi";

import UsdgloContract from "@/abi/usdglo.json";
import { ModalContext } from "@/lib/context";
import { torusPlugin } from "@/lib/web3auth";

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
      className="flex flex-col"
      onSubmit={async (e) => {
        e.preventDefault();
        await send();
      }}
    >
      <div className="form-group">
        <label htmlFor="send-address">Send Address</label>
        <input
          id="send-address"
          value={sendForm.address}
          onChange={(e) =>
            setSendForm({ ...sendForm, address: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label htmlFor="send-amount">Amount</label>
        <input
          id="send-amount"
          value={sendForm.amount}
          onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
        />
      </div>
      <button className="mt-4 primary-button" disabled={hash!}>
        Send
      </button>
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

    const torusWalletInstance = torusPlugin.torusWalletInstance;
    // torusWalletInstance.torusWidgetVisibility = false;
    // torusWalletInstance.hideTorusButton();
    console.log("torus wallet: ", torusWalletInstance);
    console.log(
      "showing torus button false: ",
      torusWalletInstance.hideTorusButton()
    );
  };

  const scan = async () => {
    if (!torusPlugin.torusWalletInstance.isInitialized) {
      console.log("Torus not initialized yet");
      return;
    }

    await torusPlugin.showWalletConnectScanner();
  };

  const transfer = async () => {
    openModal(<SendForm close={closeModal} />);
  };

  const buttons: ActionButton[] = [
    {
      iconPath: "/plus.svg",
      action: buy,
      description: "Buy Glo",
    },
    {
      iconPath: "/transfer.svg",
      action: transfer,
      description: "Transfer",
    },
    {
      iconPath: "/scan.svg",
      action: scan,
      description: "Scan",
    },
  ];

  const renderActionButtons = (buttons: ActionButton[]) =>
    buttons.map((button, idx) => (
      <li key={`actionButton${idx}`}>
        <button className="action-button mb-4" onClick={() => button.action()}>
          <Image
            src={button.iconPath}
            alt={button.description}
            width={24}
            height={24}
          />
        </button>
        <span className="cursor-default w-full flex justify-center">
          {button.description}
        </span>
      </li>
    ));

  return (
    <ul className="flex justify-around w-full px-4 mt-4 mb-8">
      {renderActionButtons(buttons)}
    </ul>
  );
}
