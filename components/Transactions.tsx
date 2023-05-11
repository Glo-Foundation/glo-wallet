import Image from 'next/image';
import { useState } from 'react';

type Transaction = {
  from: string,
  to: string,
  amount: string,
}
type Props = {
  transactions: Transaction[],
}

export default function Transactions({ transactions }: Props) {
  const [txnsState, setTxnsState] = useState("hidden");
  const renderTransactions = (txns: Transaction[]) => txns.map((txn, idx) =>
    <li key={idx} className="py-4 border-y">
      <div className="flex justify-between"><b>From:</b> {txn.from}</div>
      <div className="flex justify-between"><b>To:</b> {txn.to}</div>
      <div className="flex justify-between"><b>Amount:</b> {txn.amount} USDGLO</div>
    </li>
  );
  const toggleDropdown = () => txnsState === "hidden"
    ? setTxnsState("list-item")
    : setTxnsState("hidden");

  return (
    <div className="bg-white rounded-[20px] p-8 transition-all">
      <div className="flex justify-between cursor-default">
        <div className="font-semibold text-3xl">Transactions</div>
        <button onClick={toggleDropdown}>
          <Image className="cursor-pointer" src="/down-caret.svg" width={16} height={16} alt="down-arrow"/>
        </button>
      </div>
      <ul className={`mt-12 ${txnsState}`}>
        {renderTransactions(transactions)}
      </ul>
    </div>
  );
};
