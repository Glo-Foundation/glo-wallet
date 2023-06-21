import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import {
  useAccount,
  useBalance,
  useNetwork,
  useSignMessage,
  useSwitchNetwork,
} from "wagmi";

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
  const { chain, chains } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
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

  const { asPath, push } = useRouter();
  useEffect(() => {
    if ((!isConnected && !showedLogin) || asPath === "/sign-in") {
      openModal(<UserAuthModal />, "bg-transparent");
      localStorage.setItem("showedLogin", "true");
      push("/");
    }
  }, []);

  useEffect(() => {
    const defaultChainId = chains[0]?.id;
    if (
      isConnected &&
      chain?.id !== defaultChainId &&
      defaultChainId &&
      switchNetwork
    ) {
      switchNetwork(defaultChainId);
    }
  }, [switchNetwork]);

  const onChainSwitch = async () => {
    const res = await api().get<TransfersPage>(`/transfers/${chain?.id}`);
    setTransfers(res.data);
  };

  useEffect(() => {
    if (api()) {
      onChainSwitch();
    }
  }, [chain]);

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
        const email = Cookies.get("glo-email");

        const { data: userId } = await api().post<string>(`/sign-in`, {
          email,
        });

        Cookies.set("glo-user", userId);

        // Parallel requests
        onChainSwitch();

        api()
          .get<CTA[]>(`/ctas`)
          .then((res) => setCTAs(res.data));
      });
    } else {
      Cookies.remove("glo-email");
      Cookies.remove("glo-proof");

      if (!localStorage.getItem("showedLogin")) {
        closeModal();
        openModal(<UserAuthModal />, "bg-transparent");
      }
      localStorage.setItem("showedLogin", "true");
    }
  }, [isConnected]);

  return (
    <div className="mt-4 px-6">
      <Header />
      <div className="flex flex-col space-y-2">
        <Balance balance={balance} />
        <Transactions />
        <CTA balance={balance?.formatted} />
      </div>
    </div>
  );
}
