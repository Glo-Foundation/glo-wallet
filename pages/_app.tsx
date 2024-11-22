/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-key */
import "@/styles/globals.css";
import "react-tooltip/dist/react-tooltip.css";
import { WalletConnectOptions } from "@vechain/dapp-kit";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
import dynamic from "next/dynamic";
import localFont from "next/font/local";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { configureChains, Connector, createConfig, WagmiConfig } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import Analytics from "@/components/Analytics";
import Toast from "@/components/Toast";
import { defaultChainId, getChainRPCUrl } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { GloSequenceConnector } from "@/lib/sequence-connector";

import { getChains, isProd } from "../lib/utils";

import type { AppProps } from "next/app";

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

const { chains, publicClient, webSocketPublicClient } = configureChains(
  getChains(),
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: getChainRPCUrl(chain.id),
      }),
    }),
  ]
);

const config = createConfig({
  autoConnect: true,
  connectors: [
    new GloSequenceConnector({
      options: {
        connect: {
          app: "Glo wallet",
          networkId: defaultChainId(),
          askForEmail: true,
          settings: {
            theme: "light",
            bannerUrl: "https://i.imgur.com/P8l8pFh.png",
          },
        },
      },
      chains,
    }) as unknown as Connector,
    new MetaMaskConnector({
      chains,
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
        showQrModal: true,
        qrModalOptions: {
          themeVariables: {
            "--w3m-z-index": "11",
          },
          // explorerRecommendedWalletIds: ['d01c7758d741b363e637a817a09bcf579feae4db9f5bb16f599fdd1f66e2f974']
        },
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

const neueHaasGrotesk = localFont({
  src: [
    {
      path: "../public/fonts/NeueHaasGroteskText65Medium.woff2",
      weight: "400",
    },
    {
      path: "../public/fonts/NeueHaasGroteskText75Bold.woff2",
      weight: "600",
    },
  ],
  variable: "--font-neuehaasgrotesk",
  display: "swap",
});

const polySans = localFont({
  src: [
    {
      path: "../public/fonts/PolySans-Neutral.woff2",
      weight: "400",
    },
    {
      path: "../public/fonts/PolySans-Median.woff2",
      weight: "600",
    },
  ],
  variable: "--font-polysans",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  const [modalContent, setModalContent] = useState(<div />);
  const [modalClassName, setModalClassName] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

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
    const target = e.target as HTMLDialogElement;
    if (target.tagName !== "DIALOG")
      //This prevents issues with forms
      return;

    const rect = target.getBoundingClientRect();

    const clickedInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (clickedInDialog === false) closeModal();
  };

  const openModal = (content: JSX.Element, className: string | undefined) => {
    closeModal();
    setModalContent(content);
    setModalClassName(className || "");
    dialogRef.current?.showModal();
  };

  const setModalClass = (className = "") => setModalClassName(className);

  const openGraphData = pageProps.openGraphData || [];
  return (
    <>
      <Head>
        {openGraphData.map((og: any) => (
          <meta {...og} />
        ))}
      </Head>
      <Analytics />
      <Script
        type="module"
        async={true}
        src="https://scripts.embr.org/checkout/checkout.js"
      />
      <main
        className={`${polySans.variable} ${neueHaasGrotesk.variable} font-polysans`}
      >
        {isMounted && (
          <WagmiConfig config={config}>
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
          </WagmiConfig>
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
