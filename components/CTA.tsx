import { motion } from "framer-motion";
import Cookies from "js-cookie";
import Image from "next/image";
import { useContext } from "react";

import { ModalContext } from "@/lib/context";
import { useFreighter } from "@/lib/hooks";
import { useUserStore } from "@/lib/store";
import { DEFAULT_CTAS, api } from "@/lib/utils";
import { getImpactItems, getTotalYield } from "@/utils";

import { CompletedIcon } from "./CompletedIcon";
import IdrissModal from "./Modals/IdrissModal";
import TweetModal from "./Modals/TweetModal";

const Icon = ({ path }: { path: string }) => (
  <button className="flex border justify-center min-w-[40px] min-h-[40px] rounded-full bg-pine-200">
    <Image src={path} width={16} height={16} alt="call to action" />
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
  const { isFreighterConnected } = useFreighter();

  const gloBalance = Number(balance) || 100;
  const totalYield = getTotalYield(gloBalance);
  const item = getImpactItems(totalYield)[0];
  const icons = item
    ? `${item.emoji} x ${item.count} ${item.description}`
    : "?";

  const email = Cookies.get("glo-email") || "";

  const shareImpactText = `I just bought ${nf.format(
    gloBalance
  )} @glodollar, the antipoverty stablecoin.\n\n📈 as market cap goes up\n📉 extreme poverty goes down\n\nLearn more on my personal impact page: https://app.glodollar.org/impact/${identity}`;
  const shareImpactTextShort = `${
    shareImpactText.split("\n\n📈 as market")[0]
  }...`.replace("\n\n", "\n");

  const CTA_MAP: { [key in CTAType]: ActionButton } = {
    ["BUY_GLO_MERCH"]: {
      title: "Buy Glo Dollar Merch",
      description: "Visit the Glo store to get a hoodie!",
      iconPath: "/buy.svg",
      url: "https://merch.glodollar.org",
      // action: () => open a modal in the future,
    },
    ["JOIN_PROGRAM"]: {
      title: "Join the movement",
      description:
        "Get listed as a Glo Supporter to help us get the ball rolling.",
      iconPath: "/za-warudo.svg",
      url: "https://www.glodollar.org/get-started",
      slug: `?email=${email}`,
    },
    ["TWEEET_IMPACT"]: {
      title: "Tweet your impact",
      iconPath: "/megahorn.svg",
      description: shareImpactTextShort,
      action: () => openModal(<TweetModal tweetText={shareImpactText} />),
    },
  };
  let CTAS = DEFAULT_CTAS;

  if (!isFreighterConnected) {
    CTA_MAP["REGISTER_IDRISS"] = {
      title: "Claim free IDriss handle",
      iconPath: "/idriss.png",
      description:
        "Hold $100+ of Glo Dollar to claim an IDriss registration for this wallet",
      action: () => openModal(<IdrissModal balance={gloBalance} />),
    };
  } else {
    CTAS = DEFAULT_CTAS.slice(0, -1);
  }

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
        {ctaList.map((cta) => (
          <motion.div key={cta.type} layout transition={spring}>
            <ActionButton CTA_MAP={CTA_MAP} email={email} ctaData={cta} />
          </motion.div>
        ))}
      </ul>
    </div>
  );
}
