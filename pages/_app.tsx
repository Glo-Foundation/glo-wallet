/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-key */
import "@/styles/globals.css";
import { sequenceWallet } from "@0xsequence/wagmi-connector";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletConnectOptions } from "@vechain/dapp-kit";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import "react-tooltip/dist/react-tooltip.css";
import { createClient, http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import {
  coinbaseWallet,
  metaMask,
  safe,
  walletConnect,
} from "wagmi/connectors";

import Analytics from "@/components/Analytics";
import Toast from "@/components/Toast";
import { defaultChainId, getChainRPCUrl } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { neueHaasGrotesk, polySans, WC_COOKIE } from "@/utils";

import { getChains, isProd } from "../lib/utils";

import type { AppProps } from "next/app";

const queryClient = new QueryClient();
const DAppKitProvider = dynamic(
  async () => {
    const { DAppKitProvider: _DAppKitProvider } = await import(
      "@vechain/dapp-kit-react"
    );
    return _DAppKitProvider;
  },
  {
    ssr: false,
  }
);

const walletConnectOptions: WalletConnectOptions = {
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  metadata: {
    name: "Glo wallet",
    description: "Glo Dollar dApp",
    url: typeof window !== "undefined" ? window.location.origin : "",
    icons: [
      typeof window !== "undefined"
        ? `${window.location.origin}/glo-logo.png`
        : "",
    ],
  },
};

const config = createConfig({
  chains: getChains(),
  client({ chain }) {
    return createClient({ chain, transport: http(getChainRPCUrl(chain.id)) });
  },
  connectors: [
    sequenceWallet({
      connectOptions: {
        app: "Glo wallet",
        askForEmail: true,
        settings: {
          theme: "light",
          bannerUrl: "https://i.imgur.com/P8l8pFh.png",
        },
        projectAccessKey: "...", // TODO: add ?
      },
      defaultNetwork: defaultChainId(),
    }),
    metaMask({
      dappMetadata: {
        url: "https://app.glodollar.org",
      },
    }),
    coinbaseWallet({
      appName: "Glo Dollar",
    }),
    ["WC_READY", "WC_PREP"].includes(Cookies.get(WC_COOKIE) || "")
      ? walletConnect({
          projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
          showQrModal: true,
          qrModalOptions: {
            themeVariables: {
              "--wcm-z-index": "11",
            },
          },
        })
      : metaMask(),
    safe(),
  ],
});

export default function App({ Component, pageProps }: AppProps) {
  const [modalContent, setModalContent] = useState(<div />);
  const [modalClassName, setModalClassName] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [outsideClickDisabled, setOutsideClickDisabled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const closeModal = () => {
    setModalContent(<div />);
    dialogRef.current?.close();
  };

  const dialogClickHandler = (e: React.MouseEvent) => {
    if (outsideClickDisabled) {
      return;
    }
    const target = e.target as HTMLDialogElement;

    if (target.tagName !== "DIALOG") {
      //This prevents issues with forms
      return;
    }
    const rect = target.getBoundingClientRect();

    const clickedInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (clickedInDialog === false) closeModal();
  };

  const openModal = (
    content: JSX.Element,
    className: string | undefined,
    disableOutsideClickToClose = false
  ) => {
    closeModal();
    setModalContent(content);
    setModalClassName(className || "");
    setOutsideClickDisabled(disableOutsideClickToClose);
    dialogRef.current?.showModal();
  };

  const setModalClass = (className = "") => setModalClassName(className);

  const openGraphData: {
    key: string;
    property: string;
    content: string;
  }[] = pageProps.openGraphData || [];
  const { chain } = config.getClient();
  return (
    <>
      <Head>
        {openGraphData.map(({ key, property, content }) => (
          <meta key={key} property={property} content={content} />
        ))}
      </Head>
      <Analytics />
      <main
        className={`${polySans.variable} ${neueHaasGrotesk.variable} font-polysans`}
      >
        {isMounted && (
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <OnchainKitProvider
                apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
                chain={chain as any}
                config={{
                  appearance: {
                    mode: "light",
                    theme: "default",
                  },
                }}
              >
                <DAppKitProvider
                  genesis={isProd() ? "main" : "test"}
                  logLevel="DEBUG"
                  nodeUrl={
                    isProd()
                      ? "https://mainnet.vecha.in"
                      : "https://testnet.vechain.org/"
                  }
                  usePersistence
                  walletConnectOptions={walletConnectOptions}
                >
                  <ModalContext.Provider
                    value={{ openModal, closeModal, setModalClass }}
                  >
                    <Component {...pageProps} />
                    <dialog
                      ref={dialogRef}
                      onClick={dialogClickHandler}
                      className={`${modalClassName} outline-none bg-white`}
                    >
                      <div ref={contentRef}>{modalContent}</div>
                    </dialog>
                  </ModalContext.Provider>
                  <Toast />
                </DAppKitProvider>
              </OnchainKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        )}
      </main>
      {/* Temp disable chat */}
      {/* {!router.pathname.includes("/impact") && (
        <Script
          src="https://embed.small.chat/T02LCAUGWAWC05CXUFHJCF.js"
          async={true}
        />
      )} */}
    </>
  );
}
