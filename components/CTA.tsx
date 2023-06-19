import Cookies from "js-cookie";
import Image from "next/image";

import { useUserStore } from "@/lib/store";
import { getImpactItems, getTotalYield } from "@/utils";

import { AnimatedCheckIcon } from "./AnimatedCheckIcon";

const Icon = ({ path }: { path: string }) => (
  <div className="mr-4 flex border justify-center min-w-[40px] min-h-[40px] rounded-full bg-pine-200">
    <Image src={path} width={16} height={16} alt="call to action" />
  </div>
);

const ActionButton = ({
  CTA_MAP,
  ctaType,
  isCompleted,
}: {
  CTA_MAP: { [key in CTAType]: ActionButton };
  email: string | undefined;
  ctaType: CTAType;
  isCompleted?: boolean;
}) => {
  const cta = CTA_MAP[ctaType];
  const link = cta.url + (cta.slug || "");
  return (
    <a
      className={"flex cursor-pointer items-center py-4"}
      href={link}
      target="_blank"
      rel="noreferrer"
    >
      {isCompleted ? <AnimatedCheckIcon /> : <Icon path={cta.iconPath} />}
      <div className="flex-col w-56">
        <h3 className="font-bold text-lg">{cta.title}</h3>
        <p className="font-thin text-sm text-pine-700 leading-6">
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

export default function CTA({ balance }: { balance?: string }) {
  const { ctas } = useUserStore();
  const totalYield = getTotalYield(Number(balance));
  const item = getImpactItems(totalYield)[0];
  const icons = item ? `${item.emoji} x ${item.count}` : "?";

  const email = Cookies.get("glo-email");

  const shareImpactText = `I just bought $${balance} of @glodollar.\n\nAt scale, this gives someone in extreme poverty enough money to buy ${icons} per year. Without me donating anything.\n\nLet’s end extreme poverty.`;

  const CTA_MAP: { [key in CTAType]: ActionButton } = {
    ["SHARE_GLO"]: {
      title: "Share Glo with friends",
      iconPath: "/megahorn.svg",
      description: "Ask your friends to join Glo. Share your invite link.",
      url: "https://www.glodollar.org/refer-a-friend",
      slug: `?email1referrer=${email}`,
    },
    ["BUY_GLO_MERCH"]: {
      title: "Buy Glo Merch",
      description:
        "Glo is meant to be spent. Go to the Glo store and get a hoodie!",
      iconPath: "/buy.svg",
      url: "https://merch.glodollar.org",
      // action: () => open a modal in the future,
    },
    ["JOIN_PROGRAM"]: {
      title: "Join as early adopter",
      description: "Be the change you want to see in the world",
      iconPath: "/za-warudo.svg",
      url: "https://www.glodollar.org/get-started",
      slug: `?email=${email}`,
    },
    ["SHARE_IMPACT"]: {
      title: "Share impact",
      iconPath: "/megahorn.svg",
      description: shareImpactText,
      url: "https://twitter.com/intent/tweet",
      slug: `?text=${encodeURI(shareImpactText)}`,
    },
  };

  return (
    <div className="bg-pine-50 rounded-[20px] p-8 transition-all">
      <div className="flex justify-between cursor-default">
        <div className="font-semibold text-3xl">🌟 Help Grow Glo!</div>
      </div>
      <ul className="mt-2">
        {ctas.map((cta, index) => (
          <li key={`CTA-${index}`} className="border-b-2 last:border-none">
            <ActionButton
              CTA_MAP={CTA_MAP}
              email={email}
              ctaType={cta.type}
              isCompleted={cta.isCompleted}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
