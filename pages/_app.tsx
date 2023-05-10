import "@/styles/globals.css";
import type { AppProps } from "next/app";
import localFont from "@next/font/local";
import Analytics from "@/components/Analytics";
import { configureChains, createClient, WagmiConfig } from "wagmi";

import { publicProvider } from "wagmi/providers/public";
import { polygonMumbai } from "wagmi/chains";
import { Web3AuthConnectorInstance } from "@/lib/web3uath";
import { createContext, useEffect, useRef, useState } from "react";
import { ModalContext } from "@/lib/context";

const { chains, provider, webSocketProvider } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  connectors: [Web3AuthConnectorInstance(chains)],
  provider,
  webSocketProvider,
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

  useEffect(() => {
    dialogRef.current?.addEventListener("click", () => closeModal());
    contentRef.current?.addEventListener("click", (e) => e.stopPropagation());
  }, [dialogRef]);

  return (
    <>
      <Analytics />
      <main
        className={`${polySans.variable} ${neueHaasGrotesk.variable} font-polysans`}
      >
        <WagmiConfig client={client}>
          <ModalContext.Provider value={openModal}>
            <Component {...pageProps} />
          </ModalContext.Provider>
        </WagmiConfig>
        <dialog className="p-0" ref={dialogRef}>
          <div ref={contentRef}>{modalContent}</div>
        </dialog>
      </main>
    </>
  );
}
