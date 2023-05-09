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
  const renderTransactions = txns => txns.map((txn, idx) =>
    <li key={idx}>
      <span>{txn.from}</span>
      <span>{txn.to}</span>
      <span>{txn.amount}</span>
    </li>
  );
  return (
    <div className="bg-white rounded-[20px] p-8">
      <div className="flex justify-between cursor-default">
        <div className="font-semibold text-3xl">Transactions</div>
        <Image className="cursor-pointer" src="/down-caret.svg" width={16} height={16} />
      </div>
      <ul className={txnsState}>
        {renderTransactions(transactions)}
      </ul>
    </div>
  );
};
