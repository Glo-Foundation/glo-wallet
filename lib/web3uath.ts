import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  CONNECTED_EVENT_DATA,
  WALLET_ADAPTERS,
} from "@web3auth/base";
import { CoinbaseAdapter } from "@web3auth/coinbase-adapter";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { ModalConfig, Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import { WalletConnectV1Adapter } from "@web3auth/wallet-connect-v1-adapter";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Chain } from "wagmi";

export let web3AuthInstance: Web3Auth;
export const torusPlugin = new TorusWalletConnectorPlugin({
  walletInitOptions: {
    whiteLabel: {
      topupHide: true,
      disclaimerHide: true,
      featuredBillboardHide: true,
      theme: { isDark: false, colors: { primary: "#00a8ff" } },
      logoDark: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
      logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
    },
    useWalletConnect: true,
    enableLogging: true,
    showTorusButton: false,
  },
});

export const Web3AuthConnectorInstance = (
  chains: Chain[]
): Web3AuthConnector => {
  const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENTID!;
  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x" + chains[0].id.toString(16),
    rpcTarget: chains[0].rpcUrls.default.http[0],
    displayName: chains[0].name,
    tickerName: chains[0].nativeCurrency?.name,
    ticker: chains[0].nativeCurrency?.symbol,
  };

  web3AuthInstance = new Web3Auth({
    clientId,
    authMode: "WALLET",
    uiConfig: {
      theme: "light",
      loginMethodsOrder: ["google", "passwordless"],
      appLogo:
        "https://dashboard-public-assets.s3.amazonaws.com/glo_icon_transparent.png",
      modalZIndex: "10000",
      primaryButton: "emailLogin",
      web3AuthNetwork: "testnet",
      loginGridCol: 2,
    },
    chainConfig,
    enableLogging: true,
  });

  const openloginAdapter = new OpenloginAdapter({
    loginSettings: {
      mfaLevel: "default",
      loginProvider: "email_passwordless",
    },

    adapterSettings: {
      network: "testnet",
      whiteLabel: {
        name: "Glo Wallet",
        logoLight:
          "https://dashboard-public-assets.s3.amazonaws.com/glo_dollar_logo_pine.png",
        logoDark:
          "https://dashboard-public-assets.s3.amazonaws.com/glo_logo_lighter_grey.png",
        defaultLanguage: "en",
        dark: false,
        theme: {
          primary: "#133D38",
          secondary: "#24E5DF",
        },
      },
    },
  });
  // Needed for Buy Glo, Scan buttons
  torusPlugin.torusWalletInstance.buttonSize = 20;
  web3AuthInstance.addPlugin(torusPlugin); // Promise

  web3AuthInstance.configureAdapter(openloginAdapter);

  const metamaskAdapter = new MetamaskAdapter();

  web3AuthInstance.configureAdapter(metamaskAdapter);

  // WalletConnectV2Adapter seems to be pretty too new
  const walletConnectV1Adapter = new WalletConnectV1Adapter();

  web3AuthInstance.configureAdapter(walletConnectV1Adapter);

  const coinbaseAdapter = new CoinbaseAdapter({
    clientId,
    sessionTime: 3600, // 1 hour in seconds
    chainConfig,
    web3AuthNetwork: "testnet",
  });

  web3AuthInstance.configureAdapter(coinbaseAdapter);

  return new Web3AuthConnector({
    chains: chains,
    options: {
      web3AuthInstance,
      modalConfig,
    },
  });
};

const BLOCKED_METHODS = [
  "facebook",
  "discord",
  "twitch",
  "reddit",
  "twitter",
  "apple",
  "line",
  "github",
  "kakao",
  "linkedin",
  "weibo",
  "wechat",
];

export const modalConfig: Record<string, ModalConfig> = {
  [WALLET_ADAPTERS.OPENLOGIN]: {
    label: "openlogin",
    loginMethods: {
      passwordless: {
        name: "Email",
        logoDark:
          "https://cdn.icon-icons.com/icons2/614/PNG/512/email-envelope-outline-shape-with-rounded-corners_icon-icons.com_56530.png",
        showOnDesktop: true,
        showOnMobile: true,
        showOnModal: true,
      },
      google: {
        name: "Google",
        logoDark:
          "https://cdn.icon-icons.com/icons2/836/PNG/512/Google_icon-icons.com_66793.png",
        showOnDesktop: true,
        showOnMobile: true,
        showOnModal: true,
      },
      ...BLOCKED_METHODS.reduce(
        (acc, cur) => ({
          ...acc,
          [cur]: {
            name: cur,
            showOnModal: false,
          },
        }),
        {}
      ),
    },
  },
};

// subscribe to lifecycle events emitted by web3auth
const subscribeAuthEvents = (web3auth: Web3Auth) => {
  web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: CONNECTED_EVENT_DATA) => {
    console.log("### connected to wallet", data);
    // web3auth.provider will be available here after user is connected
  });
  web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
    console.log("### connecting");
  });
  web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
    console.log("### disconnected");
  });
  web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
    console.log("### error", error);
  });
  web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
    console.log("### error", error);
  });
};

// subscribeAuthEvents(web3Auth);

// export default web3Auth;
