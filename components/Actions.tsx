import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";

import BuyGloModal from "@/components/Modals/BuyGloModal";
import { getSmartContractAddress } from "@/lib/config";
import { ModalContext } from "@/lib/context";

export default function Actions() {
  const { openModal } = useContext(ModalContext);

  const { address, isConnected } = useAccount();
  const { asPath, push } = useRouter();

  const { chain } = useNetwork();

  const { refetch } = useBalance({
    address,
    token: getSmartContractAddress(chain?.id),
  });
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);

  const { isSuccess } = useWaitForTransaction({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      refetch();
      setHash(undefined);
    }
  }, [isSuccess]);

  const buy = async () => {
    openModal(<BuyGloModal />);
  };

  useEffect(() => {
    if (isConnected && asPath === "/buy") {
      buy();
      push("/");
    }
  }, []);

  return (
    <div
      className="flex justify-center py-4 hover:cursor-pointer bg-pine-50 rounded-b-[20px] border-t-1"
      onClick={() => buy()}
    >
      <div className="font-bold">Buy Glo Dollar</div>
      <Image
        src="/arrow-right.svg"
        width={25}
        height={25}
        alt="arrow-right"
        className="ml-2 w-25px max-w-25px h-25px max-h-25px"
      />
    </div>
  );
}
