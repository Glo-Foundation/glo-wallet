import { useAccount, useBalance, useNetwork } from "wagmi";

import Balance from "@/components/Balance";
import CTA from "@/components/CTA";
import Header from "@/components/Header";
import Transactions from "@/components/Transactions";
import { getSmartContractAddress } from "@/lib/config";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { data: balance } = useBalance({
    address,
    token: getSmartContractAddress(chain?.id),
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
