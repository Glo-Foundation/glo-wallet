import { sequence } from "0xsequence";
import { utils } from "ethers";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";

import UsdgloContract from "@/abi/usdglo.json";
import BuyModal from "@/components/BuyModal";
import { ModalContext } from "@/lib/context";

// eslint-disable-next-line @typescript-eslint/no-unused-vars,unused-imports/no-unused-vars
const SendForm = ({ close }: { close: () => void }) => {
  const [sendForm, setSendForm] = useState({
    address: "0x...",
    amount: "0.1",
  });
  const [hash, setHash] = useState<`0x${string}`>();
  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_USDGLO as `0x${string}`,
    abi: UsdgloContract,
    functionName: "transfer",
    args: [sendForm.address, utils.parseEther(sendForm.amount).toBigInt()],
    enabled: utils.isAddress(sendForm.address),
  });

  const { write: transfer, data } = useContractWrite(config);

  useEffect(() => {
    if (data?.hash) {
      setHash(data?.hash);
    }
  }, [data]);

  return (
    <form
      className="flex flex-col"
      onSubmit={async (e) => {
        e.preventDefault();
        transfer!();
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
      <button className="mt-4 primary-button" disabled={!!hash}>
        Send
      </button>
      {hash && <div>Sent with hash {hash}</div>}
    </form>
  );
};

export default function Actions() {
  const { openModal, closeModal } = useContext(ModalContext);

  const { connector } = useAccount();

  const buy = async () => {
    openModal(<BuyModal close={closeModal} />);
  };

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
        <li key={`actionButton${idx}`}>
          <button
            className="action-button mb-4"
            onClick={() => button.action()}
          >
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
