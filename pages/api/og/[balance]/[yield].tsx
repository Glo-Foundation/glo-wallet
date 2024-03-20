/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

import {
  getImpactItems,
  getUSFormattedNumber,
  isLiftPersonOutOfPovertyImpactItem,
} from "@/utils";

export const config = {
  runtime: "edge",
};

const whatCanYearlyYieldBuy = (
  yearlyYield: number,
  noImpactCopyText: string
): JSX.Element => {
  let yearlyImpactItems = getImpactItems(yearlyYield).slice(0, 2);
  const enoughToLiftPersonOutOfPoverty =
    yearlyImpactItems.length > 0 &&
    isLiftPersonOutOfPovertyImpactItem(yearlyImpactItems[0]);

  const getFormattedImpactItems = (): JSX.Element => {
    if (yearlyImpactItems.length === 0) {
      return (
        <div tw="flex text-[#133D38] text-[38px] leading-2">
          {noImpactCopyText}
        </div>
      );
    }

    if (enoughToLiftPersonOutOfPoverty) {
      yearlyImpactItems = yearlyImpactItems.slice(0, 1);
    }

    const impactItem = yearlyImpactItems[0];

    return (
      <div tw="flex flex-col">
        <div tw="flex flex-row pt-2 items-center">
          <div
            tw="flex mr-2 leading-2 text-[38px]"
            data-testid="number-persons-out-poverty"
          >
            {impactItem.count}
          </div>
          <div
            tw="mr-2 text-xs leading-2"
            style={{ fontFamily: "Arial", fontSize: "32px" }}
          >
            ×
          </div>
          <div tw="mr-2 text-2xl leading-2" style={{ fontSize: "42px" }}>
            {impactItem.emoji}
          </div>
          <div tw="mr-2 text-2xl leading-2 text-[24px] flex">
            {impactItem.description}
            {!isLiftPersonOutOfPovertyImpactItem(impactItem) && (
              <span tw="text-[#597572] text-[16px] ml-2 mt-3"> / year</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return <>{getFormattedImpactItems()}</>;
};

export default async function handler(request: NextRequest) {
  const polySansNeutralFontData = await fetch(
    new URL("/public/fonts/PolySans-Neutral.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const polySansMedianFontData = await fetch(
    new URL("/public/fonts/PolySans-Median.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const { searchParams } = new URL(request.url);
  const balance = parseFloat(searchParams.get("balance") ?? "0");
  const yearlyYield = parseFloat(searchParams.get("yield") ?? "0");
  const yearlyYieldFormatted =
    yearlyYield > 0 ? `$0 - $${yearlyYield.toFixed(0)}` : "$0";
  const formattedBalance = getUSFormattedNumber(balance);

  try {
    return new ImageResponse(
      (
        <div tw="flex flex-row justify-center items-center bg-[#EAF2F1]">
          <div
            tw="flex flex-col justify-center items-center w-[640px] h-[430px] text-[74px] leading-[90px] font-bold text-[#133D38] bg-[#EAF2F1]"
            style={{ fontFamily: "PolySansMedian" }}
          >
            <div tw="flex flex-col justify-center items-center mb-16">
              <span>Fund</span>
              <span>public</span>
              <span>goods with</span>
              <span>a stablecoin</span>
            </div>
            <img
              alt="Glo logo"
              src="https://app.glodollar.org/glo-logo-text.svg"
              width="206px"
              height="73px"
            />
          </div>
          <div tw="flex flex-col">
            <div tw="flex flex-col justify-center items-center w-[560px] h-[630px] bg-[#EAF2F1] pr-8">
              <div
                tw="flex flex-col justify-center items-center w-[366px] h-[191px] bg-[#133D38] text-white font-bold rounded-[24px] text-[74px]"
                style={{ fontFamily: "PolySansNeutral" }}
              >
                <span
                  tw="text-[24px] leading-[30px] mb-4"
                  style={{ fontFamily: "PolySansNeutral" }}
                >
                  By owning
                </span>
                <span
                  tw="text-[50px] leading-[54px] mb-4"
                  style={{ fontFamily: "PolySansMedian" }}
                >
                  ${formattedBalance}{" "}
                  <span tw="text-[27px] leading-[60px] ml-2">GLO</span>
                </span>
              </div>
              <div
                tw="flex flex-col justify-center items-center w-[468px] h-[207px] bg-[#24E5DF] text-[#133D38] font-bold rounded-[24px] text-[74px] -mt-[18px]"
                style={{ fontFamily: "PolySansMedian" }}
              >
                <span
                  tw="text-[24px] leading-[20px] mb-4"
                  style={{ fontFamily: "PolySansNeutral" }}
                >
                  I create funding of
                </span>
                <span tw="text-[50px] leading-[60px] mb-4">
                  {yearlyYieldFormatted.split(" - ").length > 1
                    ? yearlyYieldFormatted.split(" - ")[1].trim()
                    : yearlyYieldFormatted.split(" - ")[0].trim()}
                </span>
                <span
                  tw="text-[16px] leading-[24px] ml-2"
                  style={{ fontFamily: "PolySansNeutral" }}
                >
                  for charities and public goods
                </span>
              </div>
              <div
                tw="flex flex-col justify-center items-center w-[540px] h-[207px] text-[#1F3C39] bg-white font-bold rounded-[24px] text-[74px] -mt-[18px]"
                style={{ fontFamily: "PolySansMedian" }}
              >
                <span
                  tw="text-[24px] mt-4"
                  style={{ fontFamily: "PolySansNeutral" }}
                >
                  Enough to fund
                </span>
                <span
                  tw="text-[38px] leading-[48px]"
                  style={{ fontFamily: "PolySansMedian" }}
                >
                  {whatCanYearlyYieldBuy(yearlyYield, "Nothing")}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "PolySansNeutral",
            data: polySansNeutralFontData,
            style: "normal",
            weight: 400,
          },
          {
            name: "PolySansMedian",
            data: polySansMedianFontData,
            style: "normal",
            weight: 600,
          },
        ],
        emoji: "noto",
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
