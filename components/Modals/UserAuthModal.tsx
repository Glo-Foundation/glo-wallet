import {
  StellarWalletsKit,
  WalletNetwork,
  ISupportedWallet,
  XBULL_ID,
  xBullModule,
  FreighterModule,
  HanaModule,
  LobstrModule,
  RabetModule,
  AlbedoModule,
  WalletConnectModule,
  WalletConnectAllowedMethods,
} from "@creit.tech/stellar-wallets-kit/build/index";
import { useWalletModal } from "@vechain/dapp-kit-react";
import { configureChains } from "@wagmi/core";
import { publicProvider } from "@wagmi/core/providers/public";
import { WalletConnectModal } from "@walletconnect/modal";
import { SignClient } from "@walletconnect/sign-client";
import clsx from "clsx";
import Cookies from "js-cookie";
import Image from "next/image";
import { useContext, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { useConnect } from "wagmi";

import { defaultChainId } from "@/lib/config";
import { ModalContext } from "@/lib/context";
import { GloSequenceConnector } from "@/lib/sequence-connector";
import { getAllowedChains, isProd } from "@/lib/utils";

const TOS_COOKIE = "tos-agreed";

const ToS = () => (
  <span>
    <a
      target="_blank"
      className="underline"
      href="https://www.glodollar.org/articles/terms-of-service"
      rel="noreferrer"
    >
      Terms
    </a>
    &nbsp;and&nbsp;
    <a
      target="_blank"
      className="underline"
      href="https://www.glodollar.org/articles/terms-of-service"
      rel="noreferrer"
    >
      Privacy Policy
    </a>
  </span>
);

type UserAuthModalProps = {
  setStellarConnected: (bool: boolean) => void;
  setStellarAddress: (str: string) => void;
};

export default function UserAuthModal({
  setStellarConnected,
  setStellarAddress,
}: UserAuthModalProps) {
  const { connect, connectors } = useConnect();
  const { closeModal } = useContext(ModalContext);

  const { open } = useWalletModal();

  const [sendForm, setSendForm] = useState({
    email: "",
  });
  const tosAlreadyAgreed = Cookies.get(TOS_COOKIE);

  const [hasUserAgreed, setHasUserAgreed] = useState<boolean | null>(
    tosAlreadyAgreed ? true : null
  );
  const userRejected = hasUserAgreed === false;
  const tosRef = useRef<HTMLDivElement>(null);

  const requireUserAgreed = (callback: () => void) => {
    if (!hasUserAgreed) {
      setHasUserAgreed(false);
      tosRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    Cookies.set(TOS_COOKIE, "1");

    callback();
  };

  const signInWithEmail = async () => {
    const { chains } = configureChains(getAllowedChains(), [publicProvider()]);
    const emailConnector = new GloSequenceConnector({
      options: {
        connect: {
          app: "Glo wallet",
          networkId: defaultChainId(),
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

  const connectWithConnector = async (index: number) => {
    requireUserAgreed(async () => {
      if (index == 99) {
        await connectStellar();
      } else {
        // Connect with EVM connectors
        connect({ connector: connectors[index] });
      }
      closeModal();
    });
  };

  async function connectStellar() {
    const signClient = await SignClient.init({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
    });

    const stellarKit: StellarWalletsKit = new StellarWalletsKit({
      network: isProd() ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET,
      selectedWalletId: XBULL_ID,
      modules: [
        new FreighterModule(),
        new xBullModule(),
        new HanaModule(),
        new LobstrModule(),
        new RabetModule(),
        new AlbedoModule(),
        new WalletConnectModule({
          url: "https://app.glodollar.org",
          projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
          method: WalletConnectAllowedMethods.SIGN,
          description: `Glo Dollar App allows you to select which public good to fund`,
          name: "Glo Dollar",
          icons: ["public/glo-logo.svg"],
          network: isProd() ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET,
          modal: new WalletConnectModal({
            projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
          }),
          client: signClient as any, // Hmmmm
        }),
      ],
    });

    await stellarKit.openModal({
      onWalletSelected: async (option: ISupportedWallet) => {
        stellarKit.setWallet(option.id);
        const publicKey = await stellarKit.getPublicKey();
        localStorage.setItem("stellarConnected", "true");
        localStorage.setItem("stellarAddress", publicKey);
        localStorage.setItem("stellarWalletId", option.id);
        setStellarConnected(true);
        setStellarAddress(publicKey);
      },
    });
  }

  return (
    <>
      <section className="flex flex-col items-center">
        <Image
          className="border-cyan-600 border-2 bg-white rounded-full mb-[-50px] z-50"
          src="/jasper.png"
          alt="glo logo"
          width={100}
          height={100}
        />
      </section>
      <section className="sticky pt-8 px-4 py-4 flex flex-col items-center text-center bg-white rounded-t-3xl">
        <h2 className="">👋 Welcome to the Glo App</h2>
        <p className="copy text-lg -mt-5 mb-4">Jasper, Glo Foundation CEO</p>
        <p className="copy text m-0 max-w-[21rem] text-center">
          To see the impact of your Glo Dollars connect your wallet or submit
          your email to create an Eth wallet{" "}
          <a
            className="underline"
            target="_blank"
            href="https://sequence.xyz/"
            rel="noreferrer"
          >
            powered by Sequence
          </a>
          .
        </p>
      </section>
      <section className="modal-body px-4 rounded-b-3xl bg-pine-100 after:bg-pine-100">
        <div className="pt-2">
          <div className="p-0 form-group flex justify-center">
            <div className="input-container relative inline w-full">
              <input
                id="sign-in-with-email"
                className="rounded-full bg-white py-4 pl-6 pr-28 text-xl"
                placeholder={"Email"}
                value={sendForm.email}
                data-testid="submit-email-input"
                onChange={(e) =>
                  setSendForm({ ...sendForm, email: e.target.value })
                }
              />
              <button
                className="absolute top-[10px] right-1 primary-button py-3 px-6 drop-shadow-none"
                data-testid="submit-email-button"
                onClick={() => requireUserAgreed(signInWithEmail)}
              >
                Submit
              </button>
            </div>
          </div>
          <button
            className="auth-button"
            data-testid="social-login-button"
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
          {!isMobile && (
            <div>
              <button
                className="auth-button"
                data-testid="metamask-login-button"
                onClick={() => connectWithConnector(1)}
              >
                <h4>Metamask</h4>
                <Image
                  alt="metamask"
                  src="/metamask.svg"
                  width={35}
                  height={35}
                />
              </button>

              <button
                className="auth-button"
                data-testid="stellar-login-button"
                onClick={() => connectWithConnector(99)}
              >
                <h4>Stellar wallets</h4>
                <Image
                  alt="stellar"
                  src="/stellar-logo.svg"
                  width={35}
                  height={35}
                />
              </button>
            </div>
          )}

          <button
            className="auth-button"
            data-testid="walletconnect-login-button"
            onClick={() => connectWithConnector(2)}
          >
            <h4>WalletConnect (EVM)</h4>
            <Image
              alt="walletconnect"
              src="/walletconnect.svg"
              width={35}
              height={35}
            />
          </button>
          <button
            className="auth-button"
            data-testid="vechain-login-button"
            onClick={() => {
              open();
              closeModal();
            }}
          >
            <h4>VeChain</h4>
            <Image alt="ve" src="/ve.png" width={35} height={35} />
          </button>
        </div>

        <div
          ref={tosRef}
          className="pb-4 flex text-sm justify-center items-center"
        >
          <input
            type="checkbox"
            defaultChecked={hasUserAgreed || undefined}
            data-testid="tos-checkbox"
            value=""
            className={clsx(
              "w-5 h-5 rounded accent-cyan-600 outline-none bg-white",
              !hasUserAgreed && "appearance-none",
              userRejected && "border border-red-400"
            )}
            onChange={() => setHasUserAgreed(!hasUserAgreed)}
          />
          <span className="ml-2">
            Agree with <ToS />
          </span>
        </div>

        {userRejected && (
          <div className="p-2 text-center text-red-400">
            Please accept our Terms to sign up
          </div>
        )}
      </section>
    </>
  );
}
