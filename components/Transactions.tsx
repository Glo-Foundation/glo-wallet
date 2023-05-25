import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useConnect } from "wagmi";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transfer[]>([]);
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  const { chain } = useNetwork();

  useEffect(() => {
    if (chain) {
      fetch(`/api/transactions/${chain.id}/${address}`).then(async (res) => {
        const { transactions } = await res.json();
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
      {txnsState === "list-item" ? (
        transactions.length ? (
          <ul className={`mt-12 ${txnsState}`}>
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
