import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transfer[]>([]);

  const { address } = useAccount();
  const { chain } = useNetwork();

  useEffect(() => {
    console.log({ chain });
    if (chain) {
      fetch(`/api/transactions/${chain.id}/${address}`).then(async (res) => {
        const { transactions } = await res.json();
        console.log({ chain, transactions });
        setTransactions(transactions as Transfer[]);
      });
    }
  }, [chain]);

  const [txnsState, setTxnsState] = useState("hidden");
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
  const toggleDropdown = () =>
    txnsState === "hidden" ? setTxnsState("list-item") : setTxnsState("hidden");

  return (
    <div className="bg-white rounded-[20px] p-8 transition-all">
      <div className="flex justify-between cursor-default">
        <div className="font-semibold text-3xl">Transactions</div>
        {txnsState === "list-item" && (
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
      <ul className={`mt-12 ${txnsState}`}>
        {renderTransactions(transactions)}
      </ul>
    </div>
  );
}
