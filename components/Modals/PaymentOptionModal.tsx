import { RatioButton } from "@ratio.me/ratiokit-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useContext } from "react";
import { useAccount, useNetwork, useSignMessage } from "wagmi";

import { ModalContext } from "@/lib/context";
import { api } from "@/lib/utils";

export default function PaymentOptionModal() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();

  const { closeModal } = useContext(ModalContext);

  const fetchSessionToken = useCallback(async (): Promise<string | null> => {
    try {
      const result = await api().post<string>("/ratio/sessions", {
        chain: chain?.name.toUpperCase(),
      });

      return result.data;
    } catch (e) {
      console.error(e);
    }
    return null;
  }, [address, isConnected, chain]);

  return (
    <div className="flex flex-col max-w-[343px] text-pine-900">
      <div className="flex flex-row justify-between">
        <div></div>
        <button className="" onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <Link href={"/ratio"} target="_blank">
        GO TO RATIO (NEW PAGE)
      </Link>

      {isConnected && (
        <RatioButton
          text="Buy with Ratio (MODAL)"
          fetchSessionToken={async () => {
            if (isConnected) {
              return await fetchSessionToken();
            }
            return null;
          }}
          signingCallback={async (challenge: string) => {
            return await signMessageAsync({
              message: challenge,
            });
          }}
        />
      )}
    </div>
  );
}
