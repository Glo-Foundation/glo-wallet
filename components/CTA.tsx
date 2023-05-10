import Image from 'next/image';
import { useState } from 'react';

type CTA = {
  title: string,
  description: string,
  iconPath: string,
  link: string,
};

const CTAs: CTA[] = [
  {
    title: "Buy Glo Merch",
    description: "Glo is meant to be spent. Visit the Glo store and order a hoodie!",
    iconPath: "/buy.svg",
    link: "https://glodollar.org",
  },
  {
    title: "Ask Uniqlo to support Glo",
    description: "Uniqlo <> Glo sounds like a perfect match. Email to ask for it.",
    iconPath: "/za-warudo.svg",
    link: "https://glodollar.org",
  }
];
export default function CTA() {
  const renderCTAs = (ctas: CTA[]) => ctas.map((cta, idx) =>
    <li key={idx} className="flex items-center py-4 border-y">
      <div className="mr-8 flex border justify-center min-w-[32px] min-h-[32px] rounded-full bg-pine-200">
        <Image src={cta.iconPath} width={16} height={16} alt="call to action" />
      </div>
      <div>
        <h2>{cta.title}</h2>
        <span className="font-thin">{cta.description}</span>
      </div>
      <a href={cta.link}>
        <Image src="/arrow-right.svg" width={50} height={100} alt="arrow-right" />
      </a>
    </li>
  );
  return (
    <div className="bg-pine-50 rounded-[20px] p-8 transition-all">
      <div className="flex justify-between cursor-default">
        <div className="font-semibold text-3xl">Let's Glo!</div>
      </div>
      <ul className={"mt-2"}>
        {renderCTAs(CTAs)}
      </ul>
    </div>
  );
};
