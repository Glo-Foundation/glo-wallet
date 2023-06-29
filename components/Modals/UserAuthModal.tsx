import { sequence } from "0xsequence";
import {
  goerli,
  polygon,
  mainnet,
  polygonMumbai,
  Chain,
} from "@wagmi/core/chains";
import { publicProvider } from "@wagmi/core/providers/public";
import clsx from "clsx";
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

  const [hasUserAgreed, setHasUserAgreed] = useState<boolean | null>(null);
  const userRejected = hasUserAgreed === false;

  const requireUserAgreed = (callback: () => void) => {
    if (!hasUserAgreed) {
      setHasUserAgreed(false);
      return;
    }

    callback();
  };

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

  const connectWithConnector = (index: number) => {
    requireUserAgreed(() => {
      connect({ connector: connectors[index] });
      closeModal();
    });
  };

  return (
    <>
      <section className="flex flex-col items-center">
        <Image
          className="border-cyan-600 border-2 rounded-full mb-[-50px] z-50"
          src="/jeff.svg"
          alt="glo logo"
          width={100}
          height={100}
        />
      </section>
      <section className="sticky p-8 flex flex-col items-center bg-white rounded-t-3xl">
        <h1 className="">👋 Hey, it’s Jeff</h1>
        <p className="copy text-xl">
          Thanks for being part of the Glo movement!
        </p>
      </section>
      <section className="modal-body p-8 rounded-b-3xl bg-pine-100 after:bg-pine-100">
        <h2 className="flex justify-center">Sign up</h2>
        <div>
          <div className="p-0 form-group flex justify-center">
            <div className="input-container relative inline w-full">
              <input
                id="sign-in-with-email"
                className="rounded-full bg-white py-4 px-6 text-xl"
                placeholder={"Email"}
                value={sendForm.email}
                onChange={(e) =>
                  setSendForm({ ...sendForm, email: e.target.value })
                }
              />
              <button
                className="absolute top-[10px] right-1 primary-button py-3 px-6 drop-shadow-none"
                onClick={() => requireUserAgreed(signInWithEmail)}
              >
                Submit
              </button>
            </div>
          </div>
          <button
            className="auth-button"
            onClick={() => connectWithConnector(0)}
          >
            <h4>Social Login</h4>
            <div className="social-icons flex">
              <Image alt="apple" src="/apple.svg" width={35} height={35} />
              <Image
                alt="facebook"
                src="/facebook.svg"
                width={35}
                height={35}
              />
              <Image alt="google" src="/google.svg" width={35} height={35} />
            </div>
          </button>

          <button
            className="auth-button"
            onClick={() => connectWithConnector(1)}
          >
            <h4>Metamask</h4>
            <Image alt="metamask" src="/metamask.svg" width={35} height={35} />
          </button>

          <button
            className="auth-button"
            onClick={() => connectWithConnector(2)}
          >
            <h4>WalletConnect</h4>
            <Image
              alt="walletconnect"
              src="/walletconnect.svg"
              width={35}
              height={35}
            />
          </button>
        </div>
        <div className="p-2 flex justify-center items-center">
          <input
            type="checkbox"
            value=""
            className={clsx(
              "w-5 h-5 rounded accent-cyan-600 outline-none bg-white",
              !hasUserAgreed && "appearance-none",
              userRejected && "border border-red-400"
            )}
            onChange={() => setHasUserAgreed(!hasUserAgreed)}
          />
          <span className="ml-2">
            I agree with Glo&apos;s{" "}
            <a className="underline" href="https://sequence.xyz/">
              Terms of Service
            </a>
          </span>
        </div>
        {userRejected && (
          <div className="p-2 text-center text-red-400">
            Please accept our Terms of Service to sign up
          </div>
        )}
        <div className="p-2 text-center copy">
          Email and social login{" "}
          <a className="underline" href="https://sequence.xyz/">
            Powered by Sequence
          </a>
        </div>
      </section>
    </>
  );
}
