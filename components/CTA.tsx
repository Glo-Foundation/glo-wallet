import { ActionType } from "@prisma/client";
import Image from "next/image";

import { useUserStore } from "@/lib/store";

const CTAs: { [type in ActionType]: ActionButton } = {
  [ActionType.BUY_GLO_MERCH]: {
    title: "Buy Glo Merch",
    description:
      "Glo is meant to be spent. Visit the Glo store and order a hoodie!",
    iconPath: "/buy.svg",
    link: "https://merch.glodollar.org",
  },
  [ActionType.ASK_UNIQLO]: {
    title: "Ask Uniqlo to support Glo",
    description:
      "Uniqlo <> Glo sounds like a perfect match. Email to ask for it.",
    iconPath: "/za-warudo.svg",
    link: "https://uniqlo.com",
  },
  [ActionType.SHARE_GLO]: {
    title: "Share Glo",
    description: "Share gllo.",
    iconPath: "/za-warudo.svg",
    link: "https://www.glodollar.org/",
  },
};

const ActionButton = ({ action }: { action: ActionType }) => {
  const cta = CTAs[action];
  return (
    <li key={`CTA${action}`}>
      <a className="flex items-center py-4 border-y" href={cta.link}>
        <div className="mr-8 flex border justify-center min-w-[32px] min-h-[32px] rounded-full bg-pine-200">
          <Image
            src={cta.iconPath}
            width={16}
            height={16}
            alt="call to action"
          />
        </div>
        <div>
          <h2>{cta.title}</h2>
          <span className="font-thin">{cta.description}</span>
        </div>
        <Image
          src="/arrow-right.svg"
          width={50}
          height={100}
          alt="arrow-right"
        />
      </a>
    </li>
  );
};

export default function CTA() {
  const { actions } = useUserStore();

  return (
    <div className="bg-pine-50 rounded-[20px] p-8 transition-all">
      <div className="flex justify-between cursor-default">
        <div className="font-semibold text-3xl">Let&apos;s Glo!</div>
      </div>
      <ul className={"mt-2"}>
        {actions.map((action, index) => (
          <ActionButton action={action.type} key={index} />
        ))}
      </ul>
    </div>
  );
}
