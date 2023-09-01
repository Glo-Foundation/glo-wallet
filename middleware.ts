import { Ratelimit } from "@upstash/ratelimit";
import { ipAddress } from "@vercel/edge";
import { kv } from "@vercel/kv";
import { NextResponse, NextRequest } from "next/server";

import { isAuthenticated } from "./lib/auth";
import { PROHIBITED_COUNTRIES } from "./lib/config";

const ratelimit = new Ratelimit({
  redis: kv,
  // 200 requests from the same IP in 5 seconds
  limiter: Ratelimit.slidingWindow(200, "5 s"),
});

export async function middleware(req: NextRequest) {
  const country = req.geo?.country || "";
  if (PROHIBITED_COUNTRIES.includes(country)) {
    return new Response("Blocked for legal reasons", { status: 451 });
  }

  const ip = ipAddress(req) || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too many requests!", { status: 429 });
  }

  const path = req.nextUrl.pathname;
  if (path.startsWith("/api/")) {
    if (!["GET", "POST"].includes(req.method)) {
      return _error(401, "method not supported");
    }

    const isOk = await isAuthenticated(req);

    if (!isOk) {
      return _error(401, "authentication failed");
    }
  }
}

const _error = (status: number, message: string) =>
  new NextResponse(JSON.stringify({ message }), { status });
