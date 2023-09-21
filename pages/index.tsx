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
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useContext, useState } from "react";
import { useAccount, useBalance, useNetwork, useSwitchNetwork } from "wagmi";

import Balance from "@/components/Balance";
import CTA from "@/components/CTA";
import Header from "@/components/Header";
import BuyGloModal from "@/components/Modals/BuyGloModal";
import UserAuthModal from "@/components/Modals/UserAuthModal";
import { defaultChainId, getSmartContractAddress } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { getIdrissName } from "@/lib/idriss";
import { useUserStore } from "@/lib/store";
import { getAllowedChains, api, initApi, isProd } from "@/lib/utils";
import { getTotalGloBalance } from "@/utils";
import { getUSDCContractAddress } from "@/utils";

export default function Home() {
  const { address, isConnected, connector } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { openModal, closeModal } = useContext(ModalContext);
  const [idrissName, setIdrissName] = useState("");

  const usdcBalance = useBalance({
    address,
    token: getUSDCContractAddress(chain!),
    watch: true,
    cacheTime: 2_000,
  });

  const polygonId = isProd() ? polygon.id : polygonMumbai.id;
  const { data: polygonBalance } = useBalance({
    address,
    token: getSmartContractAddress(polygonId),
    watch: true,
    cacheTime: 5_000,
    chainId: polygonId,
  });

  const ethereumId = isProd() ? mainnet.id : goerli.id;
  const { data: ethereumBalance } = useBalance({
    address,
    token: getSmartContractAddress(ethereumId),
    watch: true,
    cacheTime: 5_000,
    chainId: ethereumId,
  });

  const celoId = isProd() ? celo.id : celoAlfajores.id;
  const { data: celoBalance } = useBalance({
    address,
    token: getSmartContractAddress(celoId),
    watch: true,
    cacheTime: 5_000,
    chainId: celoId,
  });

  const totalBalance = getTotalGloBalance([
    ethereumBalance,
    polygonBalance,
    celoBalance,
  ]);

  const { setCTAs } = useUserStore();
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

        api()
          .get<CTA[]>(`/ctas`)
          .then((res) => setCTAs(res.data));

        const idrissName = await getIdrissName(address!);
        setIdrissName(idrissName);
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
      openModal(<BuyGloModal totalBalance={1000} />);
      push("/");
    }
  }, []);

  return (
    <>
      <Head>
        <meta
          name="description"
          content="Sign up to buy Glo Dollar using our app. See your transactions and the impact your Glo Dollar holdings have."
        />

        <meta property="og:url" content="https://app.glodollar.org/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Glo Dollar App" />
        <meta
          property="og:description"
          content="Sign up to buy Glo Dollar using our app. See your transactions and the impact your Glo Dollar holdings have."
        />
        <meta
          property="og:image"
          content="https://uploads-ssl.webflow.com/62289d6493efe7c3b765d6bd/63d146d464f48942d593bc57_Group%204%20(3).png"
        />
        <meta property="og:image:alt" content="Glo Dollar logo" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://app.glodollar.org/" />
        <meta name="twitter:title" content="Glo Dollar App" />
        <meta
          name="twitter:description"
          content="Sign up to buy Glo Dollar using our app. See your transactions and the impact your Glo Dollar holdings have."
        />
        <meta
          name="twitter:image"
          content="https://uploads-ssl.webflow.com/62289d6493efe7c3b765d6bd/63d146d464f48942d593bc57_Group%204%20(3).png"
        />
        <meta name="twitter:image:alt" content="Glo Dollar logo" />
      </Head>
      <div className="mt-4 px-6 bg-pine-100">
        <Header idrissName={idrissName} />
        <div className="flex flex-col space-y-4">
          <Balance
            polygonBalance={polygonBalance}
            ethereumBalance={ethereumBalance}
            celoBalance={celoBalance}
            totalBalance={totalBalance}
            usdcBalance={usdcBalance.data}
          />

          <CTA
            balance={totalBalance?.formatted}
            identity={idrissName || address!}
          />
        </div>
      </div>
    </>
  );
}
