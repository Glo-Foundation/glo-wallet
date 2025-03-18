import axios from "axios";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { getEnsAddress, normalize } from "viem/ens";

import BuyGloModal from "@/components/Modals/BuyGloModal";
import Navbar from "@/components/Navbar";
import { getBalances } from "@/lib/balance";
import { ModalContext } from "@/lib/context";
import { idriss } from "@/lib/idriss";
import { lastSliceAddress, sliceAddress } from "@/lib/utils";
import {
  customFormatBalance,
  getTotalYield,
  getUSFormattedNumber,
} from "@/utils";

import { KVResponse } from "../api/transfers/first-glo/[address]";

export default function Impact({
  address,
  idrissIdentity,
  ensIdentity,
  balance,
  yearlyYield,
  polygonBalanceFormatted,
  ethereumBalanceFormatted,
  celoBalanceFormatted,
  optimismBalanceFormatted,
  arbitrumBalanceFormatted,
  baseBalanceFormatted,
  isVe,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const { openModal } = useContext(ModalContext);
  const router = useRouter();
  const { push } = router;

  const [whenFirstGlo, setWhenFirstGlo] = useState<string>("");
  const [showBalanceDropdown, setShowBalanceDropdown] = useState(false);

  const formattedBalance = getUSFormattedNumber(balance);
  const yearlyYieldFormatted =
    yearlyYield > 0 ? `$0 - $${yearlyYield.toFixed(0)}` : "$0";
  useEffect(() => {
    if (isCopiedTooltipOpen) {
      setTimeout(() => setIsCopiedTooltipOpen(false), 2000);
    }
  }, [isCopiedTooltipOpen]);
  useEffect(() => {
    const seeWhenFirstGloTransaction = async () => {
      if (!address || !address.startsWith("0x") || isVe) {
        return;
      }

      const addressToCheck = address as string;
      const { data } = await axios.get<KVResponse>(
        `/api/transfers/first-glo/${addressToCheck}`
      );
      const { dateFirstGlo } = data;
      if (dateFirstGlo) {
        setWhenFirstGlo(beautifyDate(new Date(dateFirstGlo)));
      }
    };
    seeWhenFirstGloTransaction();
  }, [address]);

  const supportedChains = [
    {
      name: "Ethereum",
      logo: "/ethereum-square-logo.svg",
      balance: ethereumBalanceFormatted,
    },
    {
      name: "Polygon",
      logo: "/polygon-matic-logo.svg",
      balance: polygonBalanceFormatted,
    },
    {
      name: "Celo",
      logo: "/celo-square-logo.svg",
      balance: celoBalanceFormatted,
    },
    {
      name: "Optimism",
      logo: "/optimism-logo.svg",
      balance: optimismBalanceFormatted,
    },
    {
      name: "Arbitrum",
      logo: "/arbitrum-logo.svg",
      balance: arbitrumBalanceFormatted,
    },
    {
      name: "Base",
      logo: "/base-logo.svg",
      balance: baseBalanceFormatted,
    },
  ];

  return (
    <>
      <Head>
        <title>Glo Impact</title>
        <meta name="keywords" content="glo, impact, stablecoin, crypto" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="Glo" />
        <meta name="twitter:site" content="@glodollar" />
        <meta name="twitter:creator" content="@glodollar" />
      </Head>
      <Navbar />
      <div className="mt-4 px-6">
        <div className="bg-white rounded-[20px] py-4">
          <div className="flex flex-col space-y-2 px-4 mb-4">
            <div className="flex flex-row font-semibold justify-start mb-4 hover:cursor-pointer">
              <Tooltip
                anchorId="copy-wallet-address"
                content="Copied!"
                noArrow={true}
                isOpen={isCopiedTooltipOpen}
                className="ml-16"
              />
              <div
                id="copy-wallet-address"
                className="flex text-xs items-center justify-start"
                onClick={() => {
                  navigator.clipboard.writeText(address as string);
                  setIsCopiedTooltipOpen(true);
                }}
              >
                <button className="primary-button w-16 h-16 p-2 text-sm text-pine-900/90 mr-4">
                  {address && lastSliceAddress(address)}
                </button>
                <div className="flex flex-col text-[14px] font-normal leading-normal text-pine-900/90">
                  <span>{sliceAddress(address as string, 4)}</span>
                  <span>{idrissIdentity || ensIdentity}</span>
                  <span>{whenFirstGlo}</span>
                </div>
              </div>
            </div>
            <div className="text-normal pb-4">Owns</div>
            <div className="flex flex-row font-extrabold justify-start relative">
              <div
                className="flex flex-row text-[2.625rem] items-baseline cursor-pointer"
                onClick={() => {
                  setShowBalanceDropdown(!showBalanceDropdown);
                }}
              >
                <span
                  className="font-extrabold"
                  data-testid="formatted-balance"
                >
                  ${formattedBalance}{" "}
                </span>
                <span className="text-sm ml-1">Glo Dollar</span>
              </div>
              {showBalanceDropdown && !isVe && (
                <div className="absolute top-10 z-10 mt-1 w-[280px] bg-white border-2 border-pine-400/90 rounded-lg">
                  <div className="h-4 w-4 bg-white border-white border-t-pine-400/90 border-r-pine-400/90 border-2 -rotate-45 transform origin-top-left translate-x-32"></div>

                  <div className="flex flex-col justify-center items-center">
                    {supportedChains.map((chain) => (
                      <div
                        key={chain.name}
                        className="flex flex-row align-middle text-[2.625rem] items-center justify-between w-[200px] mb-2"
                      >
                        <div className="text-sm text-pine-700/90 mb-1.5 w-1/6">
                          <Image
                            alt={`${chain.name} logo`}
                            src={chain.logo}
                            width={20}
                            height={20}
                          />
                        </div>
                        <div className="text-sm text-pine-700/90 mb-1.5 w-1/3">
                          {chain.name}
                        </div>
                        <div className="text-sm text-pine-700/90 mb-1.5 w-1/2 text-right">
                          ${chain?.balance?.dblFmtBalance}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div
            className="flex flex-col bg-impact-bg text-impact-fg rounded-[24px] mx-1 mb-1 px-4 pb-3 cursor-pointer"
            onClick={() => openModal(<BuyGloModal totalBalance={1000} />)}
            data-testid="simulateBuyGlo"
          >
            <div className="overflow-hidden">
              <div className="h-4 w-4 bg-white -rotate-45 transform origin-top-left translate-x-32"></div>
            </div>
            <div className="flex flex-col w-full justify-between items-start space-y-2">
              <span className="my-2">
                Generating charitable donations up to
              </span>
              <div
                className="text-[2.625rem] leading-[2.625rem] break-all font-neuehaasgrotesk"
                data-testid="yearlyYieldFormatted"
              >
                {yearlyYieldFormatted}
                <span className="text-base">/ year</span>
              </div>
              <span className="text-xs text-[11px] py-4">
                Current impact on the lower end of this range because Glo Dollar{" "}
                <a
                  className="underline"
                  href="https://www.glodollar.org/articles/from-bootstrap-to-high-impact"
                  target="_blank"
                  rel="noreferrer"
                >
                  is bootstrapping
                </a>
                . Adoption helps grow impact.
              </span>
            </div>
          </div>
          {/*<DetailedEnoughToBuy
            yearlyYield={yearlyYield}
            noImpactCopyText="Nothing."
          />*/}
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="font-normal leading-normal mt-3 mb-2">
            Fund public goods by hodling Glo
          </div>
          <button
            className="primary-button px-6"
            onClick={() => push("/sign-in")}
          >
            Buy Glo Dollar
          </button>
        </div>
      </div>
    </>
  );
}

const beautifyDate = (date?: Date) => {
  if (!date) {
    return "";
  }

  const year = date.getFullYear().toString().slice(2);
  const month = date.toLocaleString("default", { month: "long" }).toLowerCase();

  return ` 🔆 ${month.toString().toLowerCase()} ‘${year}`;
};

function formatBalance(balance: bigint) {
  const balanceValue = BigInt(balance.toString()) / BigInt(10 ** 18);
  return customFormatBalance({
    decimals: 18,
    formatted: balanceValue.toString(),
    symbol: "USDGLO",
    value: balanceValue,
  });
}

// serverside rendering
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { res } = context;
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );

  const pathname = context.req.url;
  const isVe = pathname?.includes("/impact/ve/0x");

  // identity can be an address or an idriss identity
  let { identity } = context.query;
  if (Array.isArray(identity)) {
    identity = identity[0];
  }

  if (!identity) {
    return {
      props: {
        balance: 0,
        yearlyYield: 0,
      },
    };
  }

  let address = identity;
  let idrissIdentity = "";
  let ensIdentity = "";
  if (isVe) {
    address = identity;
  } else if (identity.startsWith("0x")) {
    address = identity;
    const res = await idriss.reverseResolve(address);
    idrissIdentity = typeof res === "string" ? res : "";
  } else if (identity.includes("@")) {
    idrissIdentity = identity;
    try {
      const idrissResolvedAddresses = await idriss.resolve(idrissIdentity);
      if (idrissResolvedAddresses) {
        address = Object.values(idrissResolvedAddresses)[0] as string;
      }
    } catch (err) {}
  } else if (identity.endsWith(".eth")) {
    const client = createPublicClient({
      chain: mainnet,
      transport: http(),
    });
    const ensAddress = await getEnsAddress(client, {
      name: normalize(identity),
    });
    ensIdentity = identity;
    address = ensAddress!;
  }

  if (!address) {
    return {
      props: {
        balance: 0,
        yearlyYield: 0,
      },
    };
  }
  const {
    totalBalance: balance,
    polygonBalance,
    ethereumBalance,
    celoBalance,
    optimismBalance,
    arbitrumBalance,
    baseBalance,
    vechainBalance,
  } = await getBalances(isVe ? `ve${address}` : address);
  let yearlyYield = getTotalYield(balance);

  // round down to 0 when the yield isn't even $1
  if (yearlyYield < 1) {
    yearlyYield = 0;
  }

  // meta tags
  const ogTitle =
    "Make an impact with Glo - the stablecoin that funds public goods and charities.";
  const ogDescription =
    "Glo Dollar is a fully backed stablecoin that redistributes all profits as donations to charitable causes. Fund what matters at zero cost to you. Join the movement.";
  const ogUrl = `${process.env.VERCEL_OG_URL}${pathname}`;
  const ogImage = `${process.env.VERCEL_OG_URL}/api/og/${balance}/${yearlyYield}.png`;

  return {
    props: {
      address,
      idrissIdentity,
      ensIdentity,
      balance,
      yearlyYield,
      polygonBalanceFormatted: formatBalance(polygonBalance || BigInt(0)),
      ethereumBalanceFormatted: formatBalance(ethereumBalance || BigInt(0)),
      optimismBalanceFormatted: formatBalance(optimismBalance || BigInt(0)),
      arbitrumBalanceFormatted: formatBalance(arbitrumBalance || BigInt(0)),
      baseBalanceFormatted: formatBalance(baseBalance || BigInt(0)),
      celoBalanceFormatted: formatBalance(celoBalance || BigInt(0)),
      vechainBalanceFormatted: formatBalance(vechainBalance || BigInt(0)),
      isVe,
      openGraphData: [
        {
          property: "og:image",
          content: ogImage,
          key: "ogimage",
        },
        {
          property: "og:image:width",
          content: "1200",
          key: "ogimagewidth",
        },
        {
          property: "og:image:height",
          content: "630",
          key: "ogimageheight",
        },
        {
          property: "og:url",
          content: ogUrl,
          key: "ogurl",
        },
        {
          property: "og:title",
          content: ogTitle,
          key: "ogtitle",
        },
        {
          property: "og:description",
          content: ogDescription,
          key: "ogdesc",
        },
        {
          property: "og:type",
          content: "website",
          key: "website",
        },
        {
          name: "twitter:title",
          content: ogTitle,
          key: "twtitle",
        },
        {
          name: "twitter:description",
          content: ogDescription,
          key: "twdesc",
        },
        {
          name: "twitter:image",
          content: ogImage,
          key: "twimage",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
          key: "twsummary",
        },
        {
          name: "twitter:image:alt",
          content: "Glo Dollar impact per wallet",
          key: "twimagealt",
        },
        {
          name: "twitter:url",
          content: ogUrl,
          key: "twurl",
        },
        {
          name: "title",
          content: ogTitle,
          key: "title",
        },
        {
          name: "description",
          content: ogDescription,
          key: "desc",
        },
      ],
    },
  };
}
