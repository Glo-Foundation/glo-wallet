import { useConnex, useWallet } from "@vechain/dapp-kit-react";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  celo,
  celoAlfajores,
  goerli,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  vechain,
} from "@wagmi/core/chains";
import axios from "axios";
import Cookies from "js-cookie";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { erc20Abi } from "viem";
import { useAccount, useBalance, useEnsName, useSwitchChain } from "wagmi";

import Balance from "@/components/Balance";
import CTA from "@/components/CTA";
import BuyGloModal from "@/components/Modals/BuyGloModal";
import Recipients from "@/components/Recipients";
import {
  chainConfig,
  defaultChainId,
  getSmartContractAddress,
} from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { getIdrissName } from "@/lib/idriss";
import { useUserStore } from "@/lib/store";
import { useAutoConnect } from "@/lib/useAutoConnect";
import {
  api,
  getAllowedChains,
  horizonUrl,
  initApi,
  isProd,
} from "@/lib/utils";
import {
  customFormatBalance,
  getTotalGloBalance,
  getUSDCContractAddress,
} from "@/utils";

import Header from "./Header";
import BuyWithCoinbaseSequenceModal from "./Modals/BuyWithCoinbaseSequenceModal";
import SwapGate from "./Modals/SwapGate";
import UserAuthModal from "./Modals/UserAuthModal";

const startBalance = (decimals: number) => ({
  decimals,
  symbol: "USDGLO",
  formatted: "0",
  value: BigInt(0),
});

export default function Home() {
  const { address, isConnected, connector, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { openModal, closeModal } = useContext(ModalContext);
  const [idrissName, setIdrissName] = useState("");
  const [stellarConnected, setStellarConnected] = useState(
    localStorage.getItem("stellarConnected") === "true"
  );
  const [stellarAddress, setStellarAddress] = useState(
    localStorage.getItem("stellarAddress") || ""
  );
  const [stellarBalance, setStellarBalance] = useState(startBalance(7));

  const [veBalance, setVeBalance] = useState(startBalance(18));

  const connex = useConnex();
  const { account: veAddress } = useWallet();
  const veConnected = !!veAddress;

  useEffect(() => {
    if (veAddress) {
      // TODO: Could be replaced with Viem confifured for Ve and custom Ve testnet
      connex.thor
        .account(chainConfig[isProd() ? vechain.id : -1]) // TODO:
        .method(erc20Abi.find((x) => x.name === "balanceOf")!)
        .call(veAddress)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((result: any) => {
          const value = BigInt(result.decoded[0]);
          setVeBalance({
            ...veBalance,
            value,
            formatted: (value / BigInt(10 ** 18)).toString(),
          });
        });
    } else {
      setVeBalance(startBalance(18));
    }
  }, [veAddress]);

  const { data: ensName } = useEnsName({ address });

  const usdcBalance = useBalance({
    address,
    token: getUSDCContractAddress(chain!),

    query: {
      gcTime: 2_000,
    },
  });
  const polygonId = isProd() ? polygon.id : polygonMumbai.id;
  const { data: polygonBalance } = useBalance({
    address,
    token: getSmartContractAddress(polygonId),
    query: {
      gcTime: 2_000,
    },
    chainId: polygonId,
  });

  const ethereumId = isProd() ? mainnet.id : goerli.id;
  const { data: ethereumBalance } = useBalance({
    address,
    token: getSmartContractAddress(ethereumId),
    query: {
      gcTime: 2_000,
    },
    chainId: ethereumId,
  });

  const celoId = isProd() ? celo.id : celoAlfajores.id;
  const { data: celoBalance } = useBalance({
    address,
    token: getSmartContractAddress(celoId),
    query: {
      gcTime: 2_000,
    },
    chainId: celoId,
  });

  const optimismId = isProd() ? optimism.id : optimismSepolia.id;
  const { data: optimismBalance } = useBalance({
    address,
    token: getSmartContractAddress(optimismId),
    query: {
      gcTime: 2_000,
    },
    chainId: optimismId,
  });

  const arbitrumId = isProd() ? arbitrum.id : arbitrumSepolia.id;
  const { data: arbitrumBalance } = useBalance({
    address,
    token: getSmartContractAddress(arbitrumId),
    query: {
      gcTime: 2_000,
    },
    chainId: arbitrumId,
  });

  const baseId = isProd() ? base.id : baseSepolia.id;
  const { data: baseBalance } = useBalance({
    address,
    token: getSmartContractAddress(baseId),
    query: {
      gcTime: 2_000,
    },
    chainId: baseId,
  });

  const totalBalance = getTotalGloBalance([
    ethereumBalance,
    polygonBalance,
    celoBalance,
    optimismBalance,
    arbitrumBalance,
    stellarBalance,
    baseBalance,
    veBalance,
  ]);

  const { setCTAs, isRecipientsView } = useUserStore();
  const showedLogin = localStorage.getItem("showedLogin");

  const { asPath, push } = useRouter();

  const isSafe =
    window.location.ancestorOrigins.length > 0 &&
    window.location.ancestorOrigins[0] === "https://app.safe.global";
  useAutoConnect(isSafe);

  useEffect(() => {
    if ((!isConnected && !showedLogin) || asPath.startsWith("/sign-in")) {
      const connector = asPath.replace("/sign-in/", "");
      openModal(
        <UserAuthModal
          setStellarConnected={setStellarConnected}
          setStellarAddress={setStellarAddress}
          connector={connector}
        />,
        "bg-transparent"
      );
      localStorage.setItem("showedLogin", "true");
      push("/");
    }
  }, []);

  useEffect(() => {
    const getStellarBalance = async () => {
      const apiUrl = `${horizonUrl}/accounts/${stellarAddress}`;
      try {
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
      } catch (err) {
        console.log("Could not fetch Stellar balance");
      }
    };
    if (stellarConnected) {
      getStellarBalance();
    } else {
      setStellarBalance(startBalance(7));
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
        switchChain?.({ chainId: defaultChainId() });
      }, 0);
    }
  }, [switchChain]);

  useEffect(() => {
    if (isConnected || stellarConnected || veConnected) {
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
          await initApi(stellarAddress, 0, signature);
        } else if (veConnected) {
          await initApi(`ve${veAddress}`, vechain.id, signature);
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
          const idrissName = (await getIdrissName(address!)) as string;
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
  }, [isConnected, stellarConnected, veConnected]);

  useEffect(() => {
    if (!isConnected) {
      return;
    }
    if (asPath === "/buy") {
      openModal(<BuyGloModal totalBalance={1000} />);
      push("/");
    } else if (asPath === "/purchased-coinbase") {
      openModal(<SwapGate buyAmount={1000} />);
      push("/");
    } else if (asPath === "/purchased-sequence") {
      openModal(<BuyWithCoinbaseSequenceModal buyAmount={1000} />);
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
          ensName={ensName || ""}
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
                baseBalance={baseBalance}
                totalBalance={totalBalance}
                usdcBalance={usdcBalance.data}
                veBalance={veBalance}
                stellarConnected={stellarConnected}
                veConnected={veConnected}
              />

              <CTA
                balance={totalBalance?.formatted}
                identity={
                  idrissName || address! || stellarAddress! || veAddress!
                }
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
