import pino from "pino";

import { isProd } from "@/lib/utils";

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

if (isProd()) {
  pinoConfig["transport"] = {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  };
}

export const logger = pino(pinoConfig);
