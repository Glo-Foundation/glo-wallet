import "react-tooltip/dist/react-tooltip.css";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect, useContext, useState } from "react";
import { useAccount, useBalance, useNetwork, useSwitchNetwork } from "wagmi";

import Balance from "@/components/Balance";
import CTA from "@/components/CTA";
import Header from "@/components/Header";
import BuyGloModal from "@/components/Modals/BuyGloModal";
import UserAuthModal from "@/components/Modals/UserAuthModal";
import { defaultChainId } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { getAllowedChains, api, initApi, fetchBalance } from "@/lib/utils";
import { getUSDCContractAddress } from "@/utils";

export default function Home() {
  const { address, isConnected, connector } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { openModal, closeModal } = useContext(ModalContext);

  const [polygonBalance, setPolygonBalance] = useState<number>(0);
  const [ethereumBalance, setEthereumBalance] = useState<number>(0);
  const [celoBalance, setCeloBalance] = useState<number>(0);
  const [totalBalance, setTotalBalance] = useState<number>();

  const usdcBalance = useBalance({
    address,
    token: getUSDCContractAddress(chain!),
    watch: true,
    cacheTime: 2_000,
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
      // const key = `glo-wallet-${address}`;

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

  useEffect(() => {
    if (isConnected && asPath === "/buy") {
      openModal(<BuyGloModal />);
      push("/");
    }
  }, []);

  useEffect(() => {
    // TODO: hide balance dropdown, show loader
    fetchBalance(address!).then((balance) => {
      const polygon = balance!.polygonBalance as number;
      const ethereum = balance!.ethereumBalance as number;
      const celo = balance!.celoBalance as number;
      setPolygonBalance(polygon);
      setEthereumBalance(ethereum);
      setCeloBalance(celo);
      setTotalBalance(polygon + ethereum + celo);
      // TODO: hide loader
    });
  }, [polygonBalance, ethereumBalance, celoBalance, address]);

  return (
    <div className="mt-4 px-6 bg-pine-100">
      <Header />
      <div className="flex flex-col space-y-4">
        <Balance
          polygonBalance={polygonBalance}
          ethereumBalance={ethereumBalance}
          celoBalance={celoBalance}
          totalBalance={totalBalance}
          usdcBalance={usdcBalance.data}
        />

        <CTA balance={totalBalance} address={address!} />
      </div>
    </div>
  );
}
