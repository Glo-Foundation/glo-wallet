// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { isProd } from "./lib/utils";

Sentry.init({
  dsn: "https://3a0e99805b57493897f89cae698fe7e9@o4503920068263936.ingest.sentry.io/4505249228324864",
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
  enabled: isProd(),

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.01,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
