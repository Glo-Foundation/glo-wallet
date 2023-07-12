import Image from "next/image";
import { useEffect, useState, useContext } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useConnect } from "wagmi";

import BuyGloModal from "@/components/Modals/BuyGloModal";
import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";

import AllTransactionsModal from "./Modals/AllTransactionsModal";
import UserAuthModal from "./Modals/UserAuthModal";
import { TransactionsList } from "./TransactionsList";

export default function Transactions() {
  const { transfers, transfersCursor } = useUserStore();
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [dropdown, setDropdown] = useState("hidden");
  const [caretDir, setCaretDir] = useState("down");
  const { openModal } = useContext(ModalContext);

  const toggleDropdown = () => {
    dropdown === "list-item" ? setDropdown("hidden") : setDropdown("list-item");
    caretDir === "up" ? setCaretDir("down") : setCaretDir("up");
  };

  return (
    <div className="bg-white rounded-[20px] p-8 transition-all">
      <div
        className="flex justify-between cursor-default"
        onClick={toggleDropdown}
      >
        <h3>Transactions</h3>
        <button>
          {isConnected && (
            <Image
              className="cursor-pointer"
              src={`/${caretDir}-caret.svg`}
              width={14}
              height={14}
              alt="down-arrow"
            />
          )}
        </button>
      </div>
      {dropdown === "list-item" && transfers.length ? (
        <ul className={`mt-12 ${dropdown}`}>
          <TransactionsList txns={transfers.slice(0, 5)} chain={chain!.id} />
          {transfersCursor && (
            <li
              onClick={() => openModal(<AllTransactionsModal />)}
              className="underline cursor-pointer"
            >
              View all transactions
            </li>
          )}
        </ul>
      ) : (
        <>
          {!isConnected && (
            <div className="mt-3 text-sm">
              <span> No transactions to show - </span>
              <button
                className="inline cursor-pointer hover:decoration-solid text-blue-500"
                onClick={() => openModal(<UserAuthModal />, "bg-transparent")}
              >
                please log in
              </button>
            </div>
          )}

          {isConnected && !transfers.length && (
            <div className="mt-6 text-sm">
              <span> No transactions yet - </span>
              <button
                className="inline cursor-pointer hover:decoration-solid text-blue-500"
                onClick={() => openModal(<BuyGloModal />)}
              >
                buy some Glo?
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
