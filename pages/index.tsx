import "react-tooltip/dist/react-tooltip.css";
import {
  mainnet,
  polygon,
  celo,
  optimism,
  arbitrum,
  goerli,
  polygonMumbai,
  celoAlfajores,
  optimismSepolia,
  arbitrumSepolia,
} from "@wagmi/core/chains";
import axios from "axios";
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
import Recipients from "@/components/Recipients";
import { defaultChainId, getSmartContractAddress } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { getIdrissName } from "@/lib/idriss";
import { useUserStore } from "@/lib/store";
import { getAllowedChains, api, initApi, isProd } from "@/lib/utils";
import { customFormatBalance, getTotalGloBalance } from "@/utils";
import { getUSDCContractAddress } from "@/utils";

export default function Home() {
  const { address, isConnected, connector } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { openModal, closeModal } = useContext(ModalContext);
  const [idrissName, setIdrissName] = useState("");
  const [stellarConnected, setStellarConnected] = useState(
    localStorage.getItem("stellarConnected") === "true"
  );
  const [stellarAddress, setStellarAddress] = useState(
    localStorage.getItem("stellarAddress") || ""
  );
  const [stellarBalance, setStellarBalance] = useState({
    decimals: 7,
    symbol: "USDGLO",
    formatted: "0",
    value: BigInt(0),
  });

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

  const optimismId = isProd() ? optimism.id : optimismSepolia.id;
  const { data: optimismBalance } = useBalance({
    address,
    token: getSmartContractAddress(optimismId),
    watch: true,
    cacheTime: 5_000,
    chainId: optimismId,
  });

  const arbitrumId = isProd() ? arbitrum.id : arbitrumSepolia.id;
  const { data: arbitrumBalance } = useBalance({
    address,
    token: getSmartContractAddress(arbitrumId),
    watch: true,
    cacheTime: 5_000,
    chainId: arbitrumId,
  });

  const totalBalance = getTotalGloBalance([
    ethereumBalance,
    polygonBalance,
    celoBalance,
    optimismBalance,
    arbitrumBalance,
    stellarBalance,
  ]);

  const { setCTAs, isRecipientsView } = useUserStore();
  const showedLogin = localStorage.getItem("showedLogin");

  const { asPath, push } = useRouter();
  useEffect(() => {
    if ((!isConnected && !showedLogin) || asPath === "/sign-in") {
      openModal(
        <UserAuthModal
          setStellarConnected={setStellarConnected}
          setStellarAddress={setStellarAddress}
        />,
        "bg-transparent"
      );
      localStorage.setItem("showedLogin", "true");
      push("/");
    }
  }, []);

  useEffect(() => {
    const getStellarBalance = async () => {
      const apiUrl = `https://horizon${
        isProd() ? "" : "-testnet"
      }.stellar.org/accounts/${stellarAddress}`;
      const res = await axios.get(apiUrl, {
        headers: { Accept: "application/json" },
      });
      const stellarBalanceValue = await res.data.balances.reduce(
        (acc: any, cur: any) =>
          cur.asset_code == "USDGLO" ? (acc += parseFloat(cur.balance)) : acc,
        0
      );
      const bigIntStellarBalance = BigInt(
        `${stellarBalanceValue}`.replace(".", "")
      );
      setStellarBalance({
        decimals: 7,
        symbol: "USDGLO",
        formatted: `${stellarBalanceValue}`,
        value: bigIntStellarBalance,
      });
    };
    console.log("stellar connected? ", stellarConnected);
    if (stellarConnected) {
      console.log("When does it detect whether this has changed?");
      getStellarBalance();
    } else {
      setStellarBalance({
        decimals: 7,
        symbol: "USDGLO",
        formatted: `0`,
        value: BigInt("0"),
      });
    }
  }, [stellarConnected]);

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
    if (isConnected || stellarConnected) {
      const key = `glo-wallet-${stellarConnected ? stellarAddress : address}`;

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
        if (isConnected) {
          await initApi(address!, chain!.id, signature);
        } else if (stellarConnected) {
          await initApi(stellarAddress!, 0, signature);
        }

        const email = Cookies.get("glo-email") || null;

        const { data: userId } = await api().post<string>(`/sign-in`, {
          email,
        });

        Cookies.set("glo-user", userId);

        api()
          .get<CTA[]>(`/ctas`)
          .then((res) => setCTAs(res.data));

        if (isConnected) {
          const idrissName = await getIdrissName(address!);
          setIdrissName(idrissName);
        }
        localStorage.setItem("loggedIn", "true");
      });
    } else {
      Cookies.remove("glo-email");
      Cookies.remove("glo-proof");

      if (!localStorage.getItem("showedLogin")) {
        closeModal();
        openModal(
          <UserAuthModal
            setStellarConnected={setStellarConnected}
            setStellarAddress={setStellarAddress}
          />,
          "bg-transparent"
        );
      }
      localStorage.setItem("showedLogin", "true");
      localStorage.setItem("loggedIn", "false");
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
        <Header
          idrissName={idrissName}
          stellarConnected={stellarConnected}
          stellarAddress={stellarAddress}
          setStellarConnected={setStellarConnected}
          setStellarAddress={setStellarAddress}
        />
        <div className="flex flex-col space-y-4">
          {isRecipientsView ? (
            <Recipients
              yearlyYield={customFormatBalance(totalBalance).yearlyYield}
            />
          ) : (
            <>
              <Balance
                stellarBalance={stellarBalance}
                polygonBalance={polygonBalance}
                ethereumBalance={ethereumBalance}
                celoBalance={celoBalance}
                optimismBalance={optimismBalance}
                arbitrumBalance={arbitrumBalance}
                totalBalance={totalBalance}
                usdcBalance={usdcBalance.data}
                stellarConnected={stellarConnected}
              />

              <CTA
                balance={totalBalance?.formatted}
                identity={idrissName || address! || stellarAddress!}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
