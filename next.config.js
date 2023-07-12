/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/pl/js/script.js",
        destination: "https://plausible.io/js/script.js",
      },
      {
        source: "/pl/api/event",
        destination: "https://plausible.io/api/event",
      },
      {
        source: "/buy",
        destination: "/",
      },
      {
        source: "/sign-in",
        destination: "/",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/market-cap",
        headers: [
          // Replace with glodollar.org
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

// Injected content via Sentry wizard below
// eslint-disable-next-line
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: "global-income-coin",
    project: "glo-wallet",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
