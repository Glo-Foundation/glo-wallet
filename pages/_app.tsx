import "@/styles/globals.css";
import localFont from "@next/font/local";
import { goerli, polygonMumbai } from "@wagmi/core/chains";
import { publicProvider } from "@wagmi/core/providers/public";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { configureChains, createClient, WagmiConfig } from "wagmi";

import Analytics from "@/components/Analytics";
import { ModalContext } from "@/lib/context";
import { Web3AuthConnectorInstance } from "@/lib/web3auth";

import type { AppProps } from "next/app";

const { chains, provider, webSocketProvider } = configureChains(
  [polygonMumbai, goerli],
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
    const closeModalEvent = () => closeModal();
    const stopPropagationEvent = (e: MouseEvent) => e.stopPropagation();
    dialogRef.current?.addEventListener("click", closeModalEvent);
    contentRef.current?.addEventListener("click", stopPropagationEvent);
    return () => {
      dialogRef.current?.removeEventListener("click", closeModalEvent);
      contentRef.current?.removeEventListener("click", stopPropagationEvent);
    };
  }, [dialogRef]);

  return (
    <>
      <Analytics />
      <main
        className={`${polySans.variable} ${neueHaasGrotesk.variable} font-polysans`}
      >
        <WagmiConfig client={client}>
          <ModalContext.Provider value={{ openModal, closeModal }}>
            <Component {...pageProps} />
          </ModalContext.Provider>
          <dialog className="modal" ref={dialogRef}>
            <header className="flex justify-end">
              <button className="right-0" onClick={() => closeModal()}>
                <Image alt="x" src="/x.svg" height={16} width={16} />
              </button>
            </header>
            <main className="py-4" ref={contentRef}>
              {modalContent}
            </main>
          </dialog>
        </WagmiConfig>
      </main>
    </>
  );
}
