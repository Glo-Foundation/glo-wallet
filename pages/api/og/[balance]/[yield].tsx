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
      return <div className="mt-6 text-pine-900">{noImpactCopyText}</div>;
    }

    if (enoughToLiftPersonOutOfPoverty) {
      yearlyImpactItems = yearlyImpactItems.slice(0, 1);
    }

    const impactItem = yearlyImpactItems[0];

    return (
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-row pt-8 items-center">
            <div
              className="mr-2 leading-6"
              data-testid="number-persons-out-poverty"
            >
              {impactItem.count}
            </div>
            <div className="mr-2 text-xs leading-6 text-[28px]">&#10005;</div>
            <div className="mr-2 text-2xl leading-6 text-[48px]">
              {impactItem.emoji}
            </div>
            <div className="mr-2 text-2xl leading-6 text-[32px]">
              {impactItem.description}
              {!isLiftPersonOutOfPovertyImpactItem(impactItem) && (
                <span className="text-pine-700"> / year</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return <>{getFormattedImpactItems()}</>;
};

export default async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const balance = parseFloat(searchParams.get("balance") ?? "0");
  const yearlyYield = parseFloat(searchParams.get("yield") ?? "0");
  const yearlyYieldFormatted =
    yearlyYield > 0 ? `$0 - $${yearlyYield.toFixed(0)}` : "$0";
  const formattedBalance = getUSFormattedNumber(balance);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "1200px",
          height: "630px",
          border: "1px solid rgba(19, 61, 56, 1)",
        }}
      >
        <div
          style={{
            fontSize: 74,
            color: "rgba(19, 61, 56, 1)",
            background: "rgba(234, 242, 241, 1)",
            padding: "80px 60px 80px 60px",
            width: "640px",
            height: "630px",
            lineHeight: "1.1",
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flexDirection: "column", marginBottom: "60px" }}>
            <p id="copy-row-1">Let&apos;s end</p>
            <p id="copy-row-2">extreme</p>
            <p id="copy-row-3">poverty with</p>
            <p id="copy-row-4">a stablecoin</p>
          </div>
          <img
            alt="Glo logo"
            style={{ flexDirection: "column" }}
            src="/glo-logo-text.svg"
            width="206px"
            height="73px"
          />
        </div>
        <div>
          <div
            style={{
              width: "560px",
              height: "630px",
              background: "rgba(234, 242, 241, 1)",
              paddingTop: "40px",
              paddingRight: "36px",
            }}
          >
            <div
              style={{
                color: "white",
                background: "rgba(19, 61, 56, 1)",
                borderRadius: "24px",
                height: "180px",
                padding: "48px 36px",
                marginLeft: "40px",
                marginRight: "40px",
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                alignContent: "center",
                justifyContent: "between",
                lineHeight: "0.8",
              }}
            >
              <span
                style={{
                  height: "120px",
                  fontSize: "24px",
                  lineHeight: "0.8",
                  marginBottom: "10px",
                }}
              >
                By owning
              </span>
              <span
                style={{
                  fontSize: "50px",
                  fontWeight: "600",
                  lineHeight: "0.8",
                }}
              >
                ${formattedBalance}{" "}
                <span
                  style={{
                    fontSize: "27px",
                    lineHeight: "0.8",
                  }}
                >
                  GLO
                </span>
              </span>
            </div>
            <div
              style={{
                color: "rgba(19, 61, 56, 1)",
                background: "rgba(36, 229, 223, 1)",
                borderRadius: "24px",
                height: "190px",
                padding: "40px",
                marginLeft: "24px",
                marginRight: "24px",
                marginTop: "-18px",
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                alignContent: "center",
                justifyContent: "between",
                lineHeight: "1",
              }}
            >
              <span
                style={{
                  height: "120px",
                  fontSize: "24px",
                  fontWeight: "400",
                }}
              >
                I create basic income of
              </span>
              <span
                style={{
                  fontSize: "54px",
                  fontWeight: "600",
                  marginTop: "12px",
                }}
              >
                {yearlyYieldFormatted.split(" - ").length > 1
                  ? yearlyYieldFormatted.split(" - ")[1].trim()
                  : yearlyYieldFormatted.split(" - ")[0].trim()}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "400",
                  marginTop: "10px",
                }}
              >
                for people in extreme poverty
              </span>
            </div>
            <div
              style={{
                color: "rgba(43, 80, 76, 1)",
                background: "white",
                borderRadius: "24px",
                height: "220px",
                padding: "60px",
                marginLeft: "12px",
                marginRight: "12px",
                marginTop: "-16px",
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                alignContent: "center",
                justifyContent: "between",
                lineHeight: "1",
              }}
            >
              <span style={{ fontSize: "24px", fontWeight: "400" }}>
                Enough to buy
              </span>
              <span style={{ fontSize: "38px", fontWeight: "600" }}>
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
    }
  );
}
