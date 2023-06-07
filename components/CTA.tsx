import Cookies from "js-cookie";
import Image from "next/image";

import { useUserStore } from "@/lib/store";

const ActionButton = ({ CTA_MAP, ctaType }: { ctaType: CTAType }) => {
  const cta = CTA_MAP[ctaType];
  return (
    <li key={`CTA${ctaType}`}>
      <a
        className={`flex cursor-pointer items-center py-4 ${
          idx === Object.keys(CTAs).length ? "" : "border-b-2"
        }`}
        href={cta.url}
        target="_blank"
        rel="noreferrer"
      >
        <div className="mr-4 flex border justify-center min-w-[32px] min-h-[32px] rounded-full bg-pine-200">
          <Image
            src={cta.iconPath}
            width={16}
            height={16}
            alt="call to action"
          />
        </div>
        <div className="flex-col w-56">
          <h2>{cta.title}</h2>
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
    </li>
  );
};

export default function CTA() {
  const { ctas } = useUserStore();
  const email = Cookies.get("glo-email");
  const CTA_MAP: { [key in CTAType]: ActionButton } = {
    ["SHARE_GLO"]: {
      title: "Share Glo with friends",
      iconPath: "/megahorn.svg",
      description: "Tell even more friends. Share your invite link.",
      action: (email: string) =>
        window.location.replace(
          `https://www.glodollar.org/refer-a-friend?email1referrer=${
            email || ""
          }`
        ),
    },
    ["BUY_GLO_MERCH"]: {
      title: "Buy Glo Merch",
      description:
        "Glo is meant to be spent. Visit the Glo store and order a hoodie!",
      iconPath: "/buy.svg",
      url: "https://merch.glodollar.org",
      // action: () => open a modal in the future,
    },
    ["JOIN_PROGRAM"]: {
      title: "Join the early adopter program",
      description: "Be the change you want to see in the world",
      iconPath: "/za-warudo.svg",
      action: (email: string) =>
        window.location.replace(
          `https://www.glodollar.org/get-started?email=${email || ""}`
        ),
    },
  };

  return (
    <div className="bg-pine-50 rounded-[20px] p-8 transition-all">
      <div className="flex justify-between cursor-default">
        <div className="font-semibold text-3xl">🌟 Help Grow Glo!</div>
      </div>
      <ul className={"mt-2"}>
        {ctas.map((cta, index) => (
          <ActionButton
            CTA_MAP={CTA_MAP}
            email={email}
            ctaType={cta.type}
            key={`cta-${index}`}
          />
        ))}
      </ul>
    </div>
  );
}
