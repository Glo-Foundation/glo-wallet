import { useContext } from "react";
import { useAccount, useBalance } from "wagmi";

import Balance from "@/components/Balance";
import CTA from "@/components/CTA";
import Header from "@/components/Header";
import Transactions from "@/components/Transactions";
import { ModalContext } from "@/lib/context";

export default function Home() {
  const { address, connector, isConnected } = useAccount();
  const { data: balance, refetch } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_USDGLO as any,
  });
  const { openModal, closeModal } = useContext(ModalContext);

  const transactions = [
    {
      from: "me",
      to: "glo",
      amount: "1.001",
    },
    {
      from: "me",
      to: "rad",
      amount: "3.52",
    },
  ];

  return (
    <div className="mt-4 px-2.5">
      <Header address={address} isConnected={isConnected} />
      <div className="flex flex-col space-y-10">
        <Balance balance={balance} address={address} />
        <Transactions transactions={transactions} />
        <CTA />
      </div>
    </div>
  );
}
