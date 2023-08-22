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

type Props = {
  gloBalance: { value: number; formatted: string };
};

export default function Actions({ gloBalance }: Props) {
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
    <ul className="flex justify-around w-full mb-6">
      <button
        className={`${
          gloBalance.value == 0 ? "primary-button" : "secondary-button"
        } px-6`}
        onClick={() => openModal(<BuyGloModal />)}
      >
        Buy Glo Dollar
      </button>
    </ul>
  );
}
