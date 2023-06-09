import { sequence } from "0xsequence";
import {
  goerli,
  polygon,
  mainnet,
  polygonMumbai,
  Chain,
} from "@wagmi/core/chains";
import { publicProvider } from "@wagmi/core/providers/public";
import Image from "next/image";
import { useContext, useState } from "react";
import { useConnect } from "wagmi";
import { configureChains, Connector, createConfig, WagmiConfig } from "wagmi";

import { ModalContext } from "@/lib/context";
import { GloSequenceConnector } from "@/lib/sequence-connector";

import { isProd } from "../../lib/utils";

export default function UserAuthModal() {
  const { connect, connectors } = useConnect();
  const { closeModal } = useContext(ModalContext);
  const [sendForm, setSendForm] = useState({
    email: "",
  });

  const signInWithEmail = async () => {
    const { chains, publicClient, webSocketPublicClient } = configureChains(
      isProd() ? ([polygon, mainnet] as Chain[]) : [polygonMumbai, goerli],
      [publicProvider()]
    );
    const emailConnector = new GloSequenceConnector({
      options: {
        connect: {
          app: "Glo wallet",
          networkId: chains[0].id,
          askForEmail: true,
          settings: {
            theme: "light",
            bannerUrl: "https://i.imgur.com/P8l8pFh.png",
            signInWithEmail: sendForm.email,
          },
        },
      },
      chains,
    });
    connect({ connector: emailConnector });
    closeModal();
  };

  return (
    <>
      <section className="flex items-center border-b-2 p-8 bg-pine-100 rounded-xl">
        <Image src="/jeff.svg" alt="glo logo" width={150} height={150} />
        <h1 className="pl-8 text-2xl font-thin">Hey it’s Jeff 👋</h1>
      </section>
      <section>
        <h1 className="flex justify-center">Sign in</h1>
        <div>
          <div className="p-0 form-group flex justify-center">
            <input
              id="sign-in-with-email"
              placeholder={"email"}
              value={sendForm.email}
              onChange={(e) =>
                setSendForm({ ...sendForm, email: e.target.value })
              }
            />
            <button
              className="my-0 auth-button"
              onClick={() => signInWithEmail()}
            >
              Submit
            </button>
          </div>
          <button
            className="auth-button"
            onClick={() => {
              connect({ connector: connectors[0] });
              closeModal();
            }}
          >
            Social Login
          </button>

          <button
            className="auth-button"
            onClick={() => {
              connect({ connector: connectors[1] });
              closeModal();
            }}
          >
            Metamask
          </button>

          <button
            className="auth-button"
            onClick={() => {
              connect({ connector: connectors[2] });
              closeModal();
            }}
          >
            WalletConnect
          </button>
        </div>
      </section>
    </>
  );
}
