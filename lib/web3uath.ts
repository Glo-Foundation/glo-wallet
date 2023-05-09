import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  CONNECTED_EVENT_DATA,
  WALLET_ADAPTERS,
  WALLET_ADAPTER_TYPE,
} from "@web3auth/base";
import { ModalConfig, Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Chain } from "wagmi";

export const Web3AuthConnectorInstance = (chains: Chain[]) => {
  const web3AuthInstance = new Web3Auth({
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENTID!,
    authMode: "WALLET", // https://web3auth.io/docs/sdk/web/modal/initialize
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

    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x" + chains[0].id.toString(16),
      rpcTarget: chains[0].rpcUrls.default.http[0], // This is the public RPC we have added, please pass on your own endpoint while creating an app
      displayName: chains[0].name,
      tickerName: chains[0].nativeCurrency?.name,
      ticker: chains[0].nativeCurrency?.symbol,
    },
    enableLogging: true,
  });

  const openloginAdapter = new OpenloginAdapter({
    loginSettings: {
      mfaLevel: "default", // https://web3auth.io/docs/sdk/web/openlogin#custom-authentication-within-web3auth-modal
      loginProvider: "email_passwordless",
    },
    adapterSettings: {
      whiteLabel: {
        url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
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
  web3AuthInstance.configureAdapter(openloginAdapter);

  return new Web3AuthConnector({
    chains: chains,
    options: {
      web3AuthInstance,
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

export const modalConfig: Record<WALLET_ADAPTER_TYPE, ModalConfig> = {
  modalConfig: {
    label: "config",
    [WALLET_ADAPTERS.OPENLOGIN]: {
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
