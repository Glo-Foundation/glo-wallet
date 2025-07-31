import { useWallet } from "@vechain/dapp-kit-react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import Image from "next/image";
import { useContext } from "react";

import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { DEFAULT_CTAS } from "@/lib/utils";

import { CompletedIcon } from "./CompletedIcon";
import IdrissModal from "./Modals/IdrissModal";
import LiquidityModal from "./Modals/LiquidityModal";
import TweetModal from "./Modals/TweetModal";

const Icon = ({ path }: { path: string }) => (
  <button className="flex border justify-center min-w-[40px] min-h-[40px] rounded-full bg-pine-200">
    <Image src={path} width={16} height={16} alt="call to action" />
  </button>
);

const FillIcon = ({ path }: { path: string }) => (
  <button className="flex border justify-center min-w-[40px] min-h-[40px] rounded-full bg-black">
    <Image src={path} width={30} height={30} alt="call to action" />
  </button>
);

const ActionButton = ({
  CTA_MAP,
  ctaData,
}: {
  CTA_MAP: { [key in CTAType]: ActionButton };
  email: string | undefined;
  ctaData: CTA;
}) => {
  const cta = CTA_MAP[ctaData.type];
  const { action } = cta;

  const link = cta?.url ? cta.url + (cta.slug || "") : undefined;

  return (
    <a
      className="cta"
      href={link}
      onClick={() => (action ? action() : undefined)}
      target="_blank"
      rel="noreferrer"
    >
      {ctaData.isCompleted ? (
        <CompletedIcon name={`cta-${ctaData.type}`} path={cta.iconPath} />
      ) : cta.fillIcon ? (
        <FillIcon path={cta.iconPath} />
      ) : (
        <Icon path={cta.iconPath} />
      )}
      <div className="flex-col w-56 ml-[16px]">
        <h5>{cta.title}</h5>
        <p className="mt-1 text-xs text-pine-700 whitespace-pre-line">
          {cta.description}
        </p>
      </div>

      <Image
        src="/arrow-right.svg"
        width={25}
        height={25}
        alt="arrow-right"
        className="ml-2 flex w-25px max-w-25px h-25px max-h-25px"
      />
    </a>
  );
};

const nf = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function CTA({
  balance,
  identity = "",
}: {
  balance?: string;
  identity: string;
}) {
  const { ctas } = useUserStore();
  const { openModal } = useContext(ModalContext);

  const { account: veAddress } = useWallet();
  const isVe = !!veAddress;

  const gloBalance = Number(balance) || 100;

  const email = Cookies.get("glo-email") || "";

  const shareImpactText = `I just bought ${nf.format(
    gloBalance
  )} @glodollar, the stablecoin that funds public goods and charities.\n\nLearn more on my personal impact page: https://app.glodollar.org/impact/${
    isVe ? "ve/" : ""
  }${identity}`;

  const shareImpactTextShort = `${
    shareImpactText.split("public goods")[0]
  }...`.replace("\n\n", "\n");

  const CTA_MAP: { [key in CTAType]: ActionButton } = {
    ["JOIN_CONSORTIUM"]: {
      title: "Join the Consortium",
      description: "Embed philanthropy into your organization.",
      iconPath: "/za-warudo.svg",
      url: "https://www.glodollar.org/glo-consortium",
    },
    ["TWEEET_IMPACT"]: {
      title: "Tweet your impact",
      iconPath: "/megahorn.svg",
      description: shareImpactTextShort,
      action: () => openModal(<TweetModal tweetText={shareImpactText} />),
    },
    ["REGISTER_IDRISS"]: {
      title: "Claim free IDriss handle",
      iconPath: "/idriss.png",
      description:
        "Hold $100+ of Glo Dollar to claim an IDriss registration for this wallet",
      action: () => openModal(<IdrissModal balance={gloBalance} />),
    },
    ["ADD_BETTERSWAP_LIQUIDITY"]: {
      title: "Add to BetterSwap LP",
      iconPath: "/betterswap.png",
      fillIcon: true,
      description: "Buy Glo Dollar, add liquidity and get B3TR via VeBetterDAO",
      action: () => openModal(<LiquidityModal />),
    },
  };
  const CTAS = DEFAULT_CTAS;

  const ctaList: CTA[] = ctas.length > 0 ? ctas : CTAS;

  const spring = {
    type: "spring",
    damping: 25,
    stiffness: 120,
    duration: 0.1,
  };

  return (
    <div className="bg-pine-50 rounded-[20px] p-6">
      <div className="flex justify-between cursor-default">
        <h3>🌟 Help Grow Glo!</h3>
      </div>
      <ul className="mt-2">
        {ctaList
          // Filter out betterswap if not a Ve user
          .filter((cta) => isVe || cta.type !== "ADD_BETTERSWAP_LIQUIDITY")
          .map((cta) => (
            <motion.div key={cta.type} layout transition={spring}>
              <ActionButton CTA_MAP={CTA_MAP} email={email} ctaData={cta} />
            </motion.div>
          ))}
      </ul>
    </div>
  );
}
