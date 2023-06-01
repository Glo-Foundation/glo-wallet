import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useConnect } from "wagmi";

import { useUserStore } from "@/lib/store";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transfer[]>([]);
  const [dropdown, setDropdown] = useState("hidden");
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { transfers } = useUserStore();

  const renderTransactions = (txns: Transfer[]) =>
    txns.map((txn, idx) => (
      <li key={idx} className="py-4 border-y">
        <div className="flex justify-between">
          <b>From:</b> {txn.from}
        </div>
        <div className="flex justify-between">
          <b>To:</b> {txn.to}
        </div>
        <div className="flex justify-between">
          <b>Amount:</b> ${txn.value} USDGLO
        </div>
      </li>
    ));

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
        transactions.length ? (
          <ul className={`mt-12 ${dropdown}`}>
            {renderTransactions(transactions)}
          </ul>
        ) : (
          <span>
            Still no transactions because you don&rsquo;t have any Glo yet! why
            not ping @gglucass for some? :D
          </span>
        )
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
