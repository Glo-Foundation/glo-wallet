import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";

import Navbar from "@/components/Navbar";

export default function Impact({
  amount,
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Glo OG</title>
        <meta name="title" content={ogTitle} />
        <meta name="description" content={ogDescription} />
        <meta name="keywords" content="glo, impact, stablecoin, crypto" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="Glo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@glodollar" />
        <meta name="twitter:creator" content="@glodollar" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:url" content={ogUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:image" content={ogImage} />
      </Head>
      <Navbar />
      <div className="mt-4 px-6">
        <div className="flex flex-col items-center justify-center">
          TEST (amount: {amount}) TEST
        </div>
      </div>
    </>
  );
}

// serverside rendering
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { res } = context;
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );

  const { amount } = context.query;
  const pathname = context.req.url;

  if (!amount) {
    return {
      props: {
        amount: 0,
      },
    };
  }

  // meta tags
  const ogTitle = "The OG Title";
  const ogDescription = "The OG Description";
  const ogUrl = `${process.env.VERCEL_URL}${pathname}`;
  const ogImage = `${process.env.VERCEL_URL}/api/og/${
    Number(amount) * 10
  }/${amount}`;

  return {
    props: {
      amount,
      ogTitle,
      ogDescription,
      ogUrl,
      ogImage,
    },
  };
}
