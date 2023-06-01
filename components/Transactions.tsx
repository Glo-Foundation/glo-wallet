import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useConnect } from "wagmi";

import { useUserStore } from "@/lib/store";

export default function Transactions() {
  const { transfers } = useUserStore();
  const [transactions, setTransactions] = useState<Transfer[]>(transfers);
  const [dropdown, setDropdown] = useState("hidden");
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  const { chain } = useNetwork();

  useEffect(() => {
    if (transfers.length) {
      setDropdown("list-item");
    }
  }, transfers);

  const toggleDropdown = () =>
    dropdown === "list-item" ? setDropdown("hidden") : setDropdown("list-item");

  const renderTransactions = (txns: Transfer[]) =>
    txns.map((txn, idx) => {
      const dateTokens = new Date(txn.block_timestamp).split(" ");
      const txnDate = dateTokens[1] + " " + dateTokens[2];
      return (
        <li key={`txn-${idx}`} className="flex justify-between">
          <div>
            <span>Money {txn.from_address === address ? "Sent" : added}</span>
            <span className="copy">{txnDate}</span>
          </div>
          <div>
            <span>{tx.from_address === address ? "-" : "+"}</span>
            <span>
              {new Intl.NumberFormat("en-En", {
                style: "currency",
                currency: "USD",
              }).format(transaction.value)}
            </span>
          </div>
        </li>
      );
    });

  return (
    <div className="bg-white rounded-[20px] p-8 transition-all">
      <div className="flex justify-between cursor-default">
        <div className="font-semibold text-3xl">Transactions</div>
        {dropdown === "list-item" && (
          <button onClick={toggleDropdown}>
            <Image
              className="cursor-pointer"
              src="/down-caret.svg"
              width={16}
              height={16}
              alt="down-arrow"
            />
          </button>
        )}
      </div>
      {dropdown === "list-item" ? (
        <ul className={`mt-12 ${dropdown}`}>
          {renderTransactions(transactions)}
        </ul>
      ) : !transactions.length ? (
        <span>
          Still no transactions because you don&rsquo;t have any Glo yet! why
          not ping <b>(Garm | Glo #4654)</b> for some over on Discord? :D
        </span>
      ) : (
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
    </div>
  );
}
