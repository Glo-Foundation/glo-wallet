import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useConnect } from "wagmi";

import { useUserStore } from "@/lib/store";

export default function Transactions() {
  const { transfers } = useUserStore();
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [dropdown, setDropdown] = useState("hidden");
  const [caretDir, setCaretDir] = useState("down");

  useEffect(() => {
    if (transfers.length) {
      setDropdown("list-item");
      setCaretDir("up");
    }
  }, transfers);

  useEffect(() => {
    if (!isConnected) {
      setDropdown("hidden");
      setCaretDir("down");
    }
  }, isConnected);

  const toggleDropdown = () => {
    dropdown === "list-item" ? setDropdown("hidden") : setDropdown("list-item");
    caretDir === "up" ? setCaretDir("down") : setCaretDir("up");
  };

  const renderTransactions = (txns: Transfer[]) =>
    txns.map((txn, idx) => {
      const dateTokens = new Date(txn.ts).toDateString().split(" ");
      const txnDate = dateTokens[1] + " " + dateTokens[2];
      return (
        <li key={`txn-${idx}`} className="transaction-item">
          <div>
            <p>Money {txn.type === "outgoing" ? "sent" : "added"}</p>
            <p className="copy">{txnDate}</p>
          </div>
          <div>
            <b>
              <span>{txn.type === "outgoing" ? "-" : "+"}</span>
              <span>
                {new Intl.NumberFormat("en-En", {
                  style: "currency",
                  currency: "USD",
                }).format(txn.value)}
              </span>
            </b>
          </div>
        </li>
      );
    });

  return (
    <div className="bg-white rounded-[20px] p-8 transition-all">
      <div className="flex justify-between cursor-default">
        <div className="font-semibold text-3xl">Transactions</div>
        <button onClick={toggleDropdown}>
          {isConnected && (
            <Image
              className="cursor-pointer"
              src={`/${caretDir}-caret.svg`}
              width={16}
              height={16}
              alt="down-arrow"
            />
          )}
        </button>
      </div>
      {dropdown === "list-item" ? (
        <ul className={`mt-12 ${dropdown}`}>{renderTransactions(transfers)}</ul>
      ) : (
        <>
          {!isConnected && (
            <div className="mt-6">
              <span> No transactions to show; please </span>
              <button
                className="inline cursor-pointer hover:decoration-solid text-blue-500"
                onClick={() => connect({ connector: connectors[0] })}
              >
                connect a wallet
              </button>
              <span> first</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
