/* eslint-disable import/order */
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
import clsx from "clsx";
import Cookies from "js-cookie";
import Image from "next/image";
import { useContext, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { useConnect } from "wagmi";

import { ModalContext } from "@/lib/context";
import { isProd } from "@/lib/utils";
import { walletConnect } from "wagmi/connectors";
import { useUserStore } from "@/lib/store";
import { useRouter } from "next/router";

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

  const { recentlyUsedWc, setRecentlyUsedWc } = useUserStore();
  const { reload } = useRouter();

  const { open } = useWalletModal();

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

  const connectWithWallectConnect = () => {
    requireUserAgreed(async () => {
      setRecentlyUsedWc("wc");
      const wc = walletConnect({
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
        showQrModal: true,
        qrModalOptions: {
          themeVariables: {
            "--wcm-z-index": "11",
          },
        },
      });
      connect({ connector: wc });
      closeModal();
    });
  };

  async function connectStellar() {
    setRecentlyUsedWc("stellar");
    const stellarKit = new StellarWalletsKit({
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
        }),
      ],
    });
    await stellarKit.openModal({
      onWalletSelected: async (option: ISupportedWallet) => {
        stellarKit.setWallet(option.id);
        const address = await stellarKit.getPublicKey();
        localStorage.setItem("stellarConnected", "true");
        localStorage.setItem("stellarAddress", address);
        localStorage.setItem("stellarWalletId", option.id);
        setStellarConnected(true);
        setStellarAddress(address);
      },
    });
  }

  const ReloadWarn = () => (
    <p className="text-sm text-red-400">
      (
      <span className="underline cursor-pointer z-50" onClick={() => reload()}>
        Reload
      </span>{" "}
      this page to use <br /> WalletConnect on another chain)
    </p>
  );

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
      </section>
      <section className="modal-body px-4 rounded-b-3xl bg-pine-100 after:bg-pine-100">
        <div className="pt-2">
          <button
            className="auth-button"
            data-testid="coinbase-login-button"
            onClick={() => connectWithConnector(2)}
          >
            <h4>Coinbase</h4>
            <Image alt="coinbase" src="/coinbase.png" width={35} height={35} />
          </button>
          <button
            className="auth-button"
            data-testid="stellar-login-button"
            onClick={() => connectWithConnector(99)}
            disabled={recentlyUsedWc === "wc"}
          >
            <div>
              <h4>Stellar wallets</h4>
              {recentlyUsedWc === "wc" && <ReloadWarn />}
            </div>
            <Image
              alt="stellar"
              src="/stellar-logo.svg"
              width={35}
              height={35}
            />
          </button>

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
          {/* TODO: Temp disabled on prod*/}
          {!isProd() && (
            <button
              className="auth-button"
              data-testid="vechain-login-button"
              onClick={() =>
                requireUserAgreed(() => {
                  open();
                  closeModal();
                })
              }
            >
              <h4>VeChain</h4>
              <Image alt="ve" src="/ve.png" width={35} height={35} />
            </button>
          )}
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
