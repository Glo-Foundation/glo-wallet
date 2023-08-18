import "react-tooltip/dist/react-tooltip.css";
import {
  mainnet,
  polygon,
  celo,
  goerli,
  polygonMumbai,
  celoAlfajores,
} from "@wagmi/core/chains";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect, useContext } from "react";
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
import { defaultChainId, getSmartContractAddress } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import {
  getAllowedChains,
  api,
  initApi,
  signMsgContent,
  isProd,
} from "@/lib/utils";
import { getTotalGloBalance } from "@/utils";

export default function Home() {
  const { address, isConnected, connector } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { openModal, closeModal } = useContext(ModalContext);
  const { signMessageAsync, status } = useSignMessage({
    message: signMsgContent,
  });

  const polygonId = isProd() ? polygon.id : polygonMumbai.id;
  const { data: polygonBalance } = useBalance({
    address,
    token: getSmartContractAddress(polygonId),
    watch: true,
    cacheTime: 5_000,
  });

  const ethereumId = isProd() ? mainnet.id : goerli.id;
  const { data: ethereumBalance } = useBalance({
    address,
    token: getSmartContractAddress(ethereumId),
    watch: true,
    cacheTime: 5_000,
  });

  const celoId = isProd() ? celo.id : celoAlfajores.id;
  const { data: celoBalance } = useBalance({
    address,
    token: getSmartContractAddress(celoId),
    watch: true,
    cacheTime: 5_000,
  });

  const totalBalance = getTotalGloBalance([
    ethereumBalance,
    polygonBalance,
    celoBalance,
  ]);

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
    const allowedChains = getAllowedChains();
    const currentChainAllowed = allowedChains.some(
      (allowedChain) => allowedChain.id === chain?.id
    );

    const isSequenceWallet = connector?.id === "sequence";
    const shouldSwitchToDefault =
      !currentChainAllowed ||
      (isSequenceWallet && chain?.id !== defaultChainId());
    if (isConnected && shouldSwitchToDefault) {
      // This timeout avoids some Sequence condition race
      setTimeout(() => {
        switchNetwork?.(defaultChainId());
      }, 0);
    }
  }, [switchNetwork]);

  const onChainSwitch = async () => {
    if (chain?.id) {
      const res = await api().get<TransfersPage>(`/transfers/${chain.id}`);
      setTransfers(res.data);
    }
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
        const email = Cookies.get("glo-email") || null;

        const { data: userId } = await api().post<string>(`/sign-in`, {
          email,
        });

        Cookies.set("glo-user", userId);

        onChainSwitch().then(() => {
          api()
            .get<CTA[]>(`/ctas`)
            .then((res) => setCTAs(res.data));
        });
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
        <Balance
          polygonBalance={polygonBalance}
          ethereumBalance={ethereumBalance}
          celoBalance={celoBalance}
          totalBalance={totalBalance}
        />

        <Transactions />

        <CTA balance={totalBalance?.formatted} address={address!} />
      </div>
    </div>
  );
}
