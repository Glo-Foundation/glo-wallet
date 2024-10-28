/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-key */
import "@coinbase/onchainkit/styles.css";
import "@/styles/globals.css";
import "react-tooltip/dist/react-tooltip.css";
import { sequenceWallet } from "@0xsequence/wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Head from "next/head";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { createClient, http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import { metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors";

import Analytics from "@/components/Analytics";
import Toast from "@/components/Toast";
import { defaultChainId, getChainRPCUrl } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { neueHaasGrotesk, polySans } from "@/utils";

import { getChains } from "../lib/utils";

import type { AppProps } from "next/app";

const queryClient = new QueryClient();

const config = createConfig({
  // autoConnect: true,

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
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
      showQrModal: true,
      qrModalOptions: {
        themeVariables: {
          "--wcm-z-index": "11",
        },
      },
    }),
    coinbaseWallet({
      appName: "Glo Dollar",
    }),
  ],
});

export default function App({ Component, pageProps }: AppProps) {
  const [modalContent, setModalContent] = useState(<div />);
  const [modalClassName, setModalClassName] = useState("");
  const [isMounted, setIsMounted] = useState(false);

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
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
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
