import "@/styles/globals.css";
import localFont from "@next/font/local";
import {
  goerli,
  polygon,
  mainnet,
  polygonMumbai,
  Chain,
} from "@wagmi/core/chains";
import { publicProvider } from "@wagmi/core/providers/public";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { configureChains, Connector, createConfig, WagmiConfig } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import Analytics from "@/components/Analytics";
import { ModalContext } from "@/lib/context";
import { GloSequenceConnector } from "@/lib/sequence-connector";

import { isProd } from "../lib/utils";

import type { AppProps } from "next/app";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  isProd() ? ([polygon, mainnet] as Chain[]) : [polygonMumbai, goerli],
  [publicProvider()]
);

export const gloSequenceConnector = new GloSequenceConnector({
  options: {
    connect: {
      app: "Glo wallet",
      networkId: chains[0].id,
      askForEmail: true,
    },
  },
  chains,
});

const config = createConfig({
  autoConnect: true,
  connectors: [
    gloSequenceConnector as unknown as Connector,
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const openModal = (content: JSX.Element) => {
    setModalContent(content);
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    setModalContent(<div />);
    dialogRef.current?.close();
  };

  return (
    <>
      <Analytics />
      <main
        className={`${polySans.variable} ${neueHaasGrotesk.variable} font-polysans`}
      >
        {isMounted && (
          <WagmiConfig config={config}>
            <ModalContext.Provider value={{ openModal, closeModal }}>
              <Component {...pageProps} />
              <dialog className="modal" ref={dialogRef}>
                <header className="flex justify-end">
                  <button className="right-0" onClick={() => closeModal()}>
                    <Image alt="x" src="/x.svg" height={16} width={16} />
                  </button>
                </header>
                <div className="py-4" ref={contentRef}>
                  {modalContent}
                </div>
              </dialog>
            </ModalContext.Provider>
          </WagmiConfig>
        )}
      </main>
    </>
  );
}
