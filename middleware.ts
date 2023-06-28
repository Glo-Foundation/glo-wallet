import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

import { isAuthenticated } from "./lib/auth";

// https://en.wikipedia.org/wiki/ISO_3166-1
const PROHIBITED_COUNTRIES = [
  "BY", // Belarus
  "BA", // Bosnia And Herzegovina
  "BI", // Burundi
  "CF", // Central African Republic
  "CD", // Congo, The Democratic Republic Of The
  "CU", // Cuba
  "IR", // Iran, Islamic Republic Of
  "IQ", // Iraq
  "KP", // Korea, Democratic People's Republic Of
  "XK", // Kosovo
  "LB", // Lebanon
  "LY", // Libya
  "MK", // Macedonia
  "NI", // Nicaragua
  "RU", // Russian Federation
  "SO", // Somalia
  "SS", // South Sudan
  "SD", // Sudan
  "SY", // Syrian Arab Republic
  "UA", // Ukraine
  "VE", // Venezuela
  "YE", // Yemen
  "ZW", // Zimbabwe
];

export async function middleware(req: NextRequest) {
  const country = req.geo?.country || "";
  if (PROHIBITED_COUNTRIES.includes(country)) {
    return new Response("Blocked for legal reasons", { status: 451 });
  }

  if (!["GET", "POST"].includes(req.method)) {
    return _error(401, "method not supported");
  }

  const isOk = await isAuthenticated(req);

  if (!isOk) {
    return _error(401, "authentication failed");
  }
}

const _error = (status: number, message: string) =>
  new NextResponse(JSON.stringify({ message }), { status });

export const config = {
  matcher: "/api/(.*)",
};
