import Cookies from "js-cookie";
import { useState, useEffect, useContext } from "react";
import { useAccount, useBalance, useNetwork, useSignMessage } from "wagmi";

import Balance from "@/components/Balance";
import CTA from "@/components/CTA";
import Header from "@/components/Header";
import UserAuthModal from "@/components/Modals/UserAuthModal";
import Transactions from "@/components/Transactions";
import { getSmartContractAddress } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { api, initApi, signMsgContent } from "@/lib/utils";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { openModal, closeModal } = useContext(ModalContext);
  const { signMessageAsync, status } = useSignMessage({
    message: signMsgContent,
  });

  const { data: balance } = useBalance({
    address,
    token: getSmartContractAddress(chain?.id),
    watch: true,
  });

  const { setTransfers, setCTAs } = useUserStore();
  const showedLogin = localStorage.getItem("showedLogin");

  useEffect(() => {
    if (!showedLogin) {
      closeModal();
      openModal(<UserAuthModal />);
      localStorage.setItem("showedLogin", "true");
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      const key = `glo-wallet-${address}`;

      const sign = async () => {
        return "public-signature";
        // Temporary disabled
        // const storedSignature = localStorage.getItem(key);
        // if (storedSignature) {
        //   return storedSignature;
        // }

        // const signature = await signMessageAsync();
        // localStorage.setItem(key, signature); return signature;
      };

      sign().then(async (signature: string) => {
        await initApi(address!, chain!.id, signature);
        try {
          const { data: ctas } = await api().get<CTA[]>(`/ctas`);
          setCTAs(ctas);
        } catch (err) {
          console.log("Invalid signature disconnecting wallet");
          localStorage.removeItem(key);
          return;
        }

        const { data: transfers } = await api().get<Transfer[]>(
          `/transfers/${chain?.id}`
        );
        setTransfers(transfers);
        localStorage.setItem("showedLogin", "true");
      });
    } else {
      Cookies.remove("glo-email");
      Cookies.remove("glo-proof");

      if (!localStorage.getItem("showedLogin")) {
        closeModal();
        openModal(<UserAuthModal />);
      }
      localStorage.setItem("showedLogin", "true");
    }
  }, [isConnected]);

  return (
    <div className="mt-4 px-2.5">
      <Header />
      <div className="flex flex-col space-y-10">
        <Balance balance={balance} />
        <Transactions />
        <CTA />
      </div>
    </div>
  );
}
