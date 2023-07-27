import "@/styles/globals.css";
import "react-tooltip/dist/react-tooltip.css";
import {
  goerli,
  polygon,
  mainnet,
  polygonMumbai,
  Chain,
} from "@wagmi/core/chains";
import { publicProvider } from "@wagmi/core/providers/public";
import localFont from "next/font/local";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { configureChains, Connector, createConfig, WagmiConfig } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import Analytics from "@/components/Analytics";
import RatioWrapper from "@/components/RatioWrapper";
import Toast from "@/components/Toast";
import { ModalContext } from "@/lib/context";
import { GloSequenceConnector } from "@/lib/sequence-connector";

import { isProd } from "../lib/utils";

import type { AppProps } from "next/app";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  isProd() ? ([polygon, mainnet] as Chain[]) : [polygonMumbai, goerli],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  connectors: [
    new GloSequenceConnector({
      options: {
        connect: {
          app: "Glo wallet",
          networkId: chains[0].id,
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const openModal = (content: JSX.Element, className: string | undefined) => {
    closeModal();
    setModalContent(content);
    setModalClassName(className || "");
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    setModalContent(<div />);
    dialogRef.current?.close();
  };

  const setModalClass = (className = "") => setModalClassName(className);

  // Might be redundant after adjusting global css
  // margin: 0 auto 40px !important;
  const isPaymentDialogOpen = modalClassName.includes("payment-dialog");

  return (
    <>
      <Analytics />
      <Script
        src="https://embed.small.chat/T02LCAUGWAWC05CXUFHJCF.js"
        async={true}
      />
      <main
        className={`${polySans.variable} ${neueHaasGrotesk.variable} font-polysans`}
      >
        {isMounted && (
          <WagmiConfig config={config}>
            <ModalContext.Provider
              value={{ openModal, closeModal, setModalClass }}
            >
              <Component {...pageProps} />
              <dialog
                ref={dialogRef}
                className={`${modalClassName} outline-none`}
              >
                <div ref={contentRef}>{modalContent}</div>
              </dialog>
            </ModalContext.Provider>
            <Toast />
            {isPaymentDialogOpen && <RatioWrapper />}
          </WagmiConfig>
        )}
      </main>
    </>
  );
}
