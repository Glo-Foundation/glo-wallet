import { RatioButton } from "@ratio.me/ratiokit-react";
import { useCallback, useContext } from "react";
import { useAccount, useNetwork, useSignMessage } from "wagmi";

import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { api } from "@/lib/utils";

export default function RatioWrapper() {
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();
  const { setRatio } = useUserStore();

  const { setModalClass } = useContext(ModalContext);
  const cleanModal = () => setModalClass(""); // figure out callback to checkpoints
  const verifyRatio = () => {
    setRatio(true);
    cleanModal();
  };

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
    <div id="ratio-button-parent" className="hidden">
      <RatioButton
        text="hide me"
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
        onClose={cleanModal}
        onError={cleanModal}
        onTransactionComplete={verifyRatio}
      />
    </div>
  );
}
