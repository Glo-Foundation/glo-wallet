import { sequence } from "0xsequence";
import { utils } from "ethers";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { prepareWriteContract, writeContract } from "wagmi/actions";

import UsdgloContract from "@/abi/usdglo.json";
import BuyGloModal from "@/components/Modals/BuyGloModal";
import { ModalContext } from "@/lib/context";
import { useToastStore } from "@/lib/store";
import { sliceAddress } from "@/lib/utils";

const SendForm = ({ close }: { close: () => void }) => {
  const [sendForm, setSendForm] = useState({
    address: "",
    amount: "",
  });
  const [setShowToast] = useToastStore((state) => [state.setShowToast]);
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    try {
      const { request } = await prepareWriteContract({
        address: process.env.NEXT_PUBLIC_USDGLO as `0x${string}`,
        abi: UsdgloContract,
        functionName: "transfer",
        args: [
          sendForm.address,
          utils.parseEther(sendForm.amount || "0").toBigInt(),
        ],
      });
      const { hash } = await writeContract(request);
      if (hash) {
        setShowToast({
          showToast: true,
          message: `Sent with hash ${sliceAddress(hash(8), 5)}`,
        });
      }
    } catch (err: any) {
      setShowToast({ showToast: true, message: err.message.split(".")[0] });
    }
    close();
  };
  return (
    <form className="flex flex-col w-[275px]" onSubmit={handleSubmit}>
      <h3>Transfer</h3>
      <div className="copy">
        <p>Send a transaction to someone else!</p>
        <p>
          Accepted values: address must start with 0x and contain only
          hexadecimal values (0-9, a-f)
        </p>
        <p>
          Amount must be greater than 0 and cannot contain more than 18 decimal
          places.
        </p>
      </div>
      <div className="form-group">
        <label htmlFor="send-address">Send Address</label>
        <input
          id="send-address"
          type="text"
          required
          onChange={(e) =>
            setSendForm({ ...sendForm, address: e.target.value })
          }
          value={sendForm.address}
          placeholder="0x..."
          pattern="0x[a-fA-F0-9]+"
        />
      </div>
      <div className="form-group">
        <label htmlFor="send-amount">Amount</label>
        <input
          id="send-amount"
          required
          pattern="\d*(\.\d{1,18})?"
          placeholder="0.1"
          tabIndex={0}
          onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
          value={sendForm.amount}
        />
      </div>
      <button className="mt-4 primary-button">Send</button>
    </form>
  );
};

export default function Actions() {
  const { openModal, closeModal } = useContext(ModalContext);

  const { connector, isConnected } = useAccount();
  const { asPath, push } = useRouter();

  const buy = async () => {
    openModal(<BuyGloModal />);
  };

  useEffect(() => {
    if (isConnected && asPath === "/buy") {
      buy();
      push("/");
    }
  }, []);

  const scan = async () => {
    const wallet = sequence.getWallet();
    wallet.openWallet("/wallet/scan");
  };

  const transfer = async () => {
    openModal(
      <div className="p-4">
        <div className="flex flex-row justify-between">
          <div></div>
          <button className="" onClick={() => closeModal()}>
            <Image alt="x" src="/x.svg" height={16} width={16} />
          </button>
        </div>
        <SendForm close={closeModal} />
      </div>
    );
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
      disabled: connector?.name !== "Sequence",
    },
  ];

  const renderActionButtons = (buttons: ActionButton[]) =>
    buttons
      .filter((button) => !button.disabled)
      .map((button, idx) => (
        <li
          className="flex flex-col justify-center"
          key={`actionButton${idx} || 0`}
        >
          <button
            className="action-button mb-4"
            onClick={() => button.action()}
          >
            <Image
              src={button.iconPath}
              alt={button.description}
              width={16}
              height={16}
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
