import { isTestnetProd, isMainnetProd } from "@lib/constants";
import pino from "pino";

const pinoConfig = {
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
};

if (!(isTestnetProd() && isMainnetProd())) {
  pinoConfig["transport"] = {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  };
}

export const logger = pino(pinoConfig);
