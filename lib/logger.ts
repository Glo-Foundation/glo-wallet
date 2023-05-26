import pino from "pino";

import { isMainnetProd } from "@/lib/constants";

const pinoConfig = {
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
};

if (!(isTestProd() && isMainnetProd())) {
  pinoConfig["transport"] = {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  };
}

export const logger = pino(pinoConfig);
