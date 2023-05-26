import pino from "pino";

import { isTestnetProd, isMainnetProd } from "lib/constants";

type PinoConfig = {
  level: string;
  formatters: any;
  transport?: any;
};
const pinoConfig: PinoConfig = {
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
