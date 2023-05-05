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
    ];
  },
};

module.exports = nextConfig;
