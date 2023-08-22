import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="description"
          content="Sign up to buy Glo Dollar using our app. See your transactions and the impact your Glo Dollar holdings have."
        />

        <meta property="og:url" content="https://app.glodollar.org/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Glo Dollar App" />
        <meta
          property="og:description"
          content="Sign up to buy Glo Dollar using our app. See your transactions and the impact your Glo Dollar holdings have."
        />
        <meta
          property="og:image"
          content="https://uploads-ssl.webflow.com/62289d6493efe7c3b765d6bd/63d146d464f48942d593bc57_Group%204%20(3).png"
        />
        <meta property="og:image:alt" content="Glo Dollar logo" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://app.glodollar.org/" />
        <meta name="twitter:title" content="Glo Dollar App" />
        <meta
          name="twitter:description"
          content="Sign up to buy Glo Dollar using our app. See your transactions and the impact your Glo Dollar holdings have."
        />
        <meta
          name="twitter:image"
          content="https://uploads-ssl.webflow.com/62289d6493efe7c3b765d6bd/63d146d464f48942d593bc57_Group%204%20(3).png"
        />
        <meta name="twitter:image:alt" content="Glo Dollar logo" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
