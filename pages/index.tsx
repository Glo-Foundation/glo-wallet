import { useAccount, useBalance } from "wagmi";

import Balance from "@/components/Balance";
import CTA from "@/components/CTA";
import Header from "@/components/Header";
import Transactions from "@/components/Transactions";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_USDGLO as any,
  });

  return (
    <div className="mt-4 px-2.5">
      <Header address={address} isConnected={isConnected} />
      <div className="flex flex-col space-y-10">
        <Balance balance={balance} />
        <Transactions />
        <CTA />
      </div>
    </div>
  );
}
