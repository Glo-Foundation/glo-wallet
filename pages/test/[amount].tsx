import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";

import Navbar from "@/components/Navbar";

export default function Impact({
  amount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Glo OG</title>
        <meta name="keywords" content="glo, impact, stablecoin, crypto" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="Glo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@glodollar" />
        <meta name="twitter:creator" content="@glodollar" />
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
  const ogUrl = `${process.env.VERCEL_OG_URL}${pathname}`;
  const ogImage = `${process.env.VERCEL_OG_URL}/api/og/${
    Number(amount) * 10
  }/${amount}`;

  return {
    props: {
      amount,
      openGraphData: [
        {
          property: "og:image",
          content: ogImage,
          key: "ogimage",
        },
        {
          property: "og:image:width",
          content: "1200",
          key: "ogimagewidth",
        },
        {
          property: "og:image:height",
          content: "630",
          key: "ogimageheight",
        },
        {
          property: "og:url",
          content: ogUrl,
          key: "ogurl",
        },
        {
          property: "og:title",
          content: ogTitle,
          key: "ogtitle",
        },
        {
          property: "og:description",
          content: ogDescription,
          key: "ogdesc",
        },
        {
          property: "og:type",
          content: "website",
          key: "website",
        },
        {
          name: "twitter:title",
          content: ogTitle,
          key: "twtitle",
        },
        {
          name: "twitter:description",
          content: ogDescription,
          key: "twdesc",
        },
        {
          name: "twitter:image",
          content: ogImage,
          key: "twimage",
        },
        {
          name: "twitter:url",
          content: ogUrl,
          key: "twurl",
        },
        {
          name: "title",
          content: ogTitle,
          key: "title",
        },
        {
          name: "description",
          content: ogDescription,
          key: "desc",
        },
      ],
    },
  };
}
