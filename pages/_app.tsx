import "@/styles/globals.css";
import type { AppProps } from "next/app";
import localFont from "@next/font/local";
import Analytics from "@/components/Analytics";

const neueHaasGrotesk = localFont({
  src: [
    {
      path: "../public/fonts/NeueHaasGroteskText65Medium.woff2",
      weight: "400",
    },
    {
      path: "../public/fonts/NeueHaasGroteskText75Bold.woff2",
      weight: "600",
    },
  ],
  variable: "--font-neuehaasgrotesk",
  display: "swap",
});

const polySans = localFont({
  src: [
    {
      path: "../public/fonts/PolySans-Neutral.woff2",
      weight: "400",
    },
    {
      path: "../public/fonts/PolySans-Median.woff2",
      weight: "600",
    },
  ],
  variable: "--font-polysans",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Analytics />
      <main
        className={`${polySans.variable} ${neueHaasGrotesk.variable} font-polysans`}
      >
        <Component {...pageProps} />
      </main>
    </>
  );
}
