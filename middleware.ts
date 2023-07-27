import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

import { isAuthenticated } from "./lib/auth";
import { PROHIBITED_COUNTRIES } from "./lib/config";

const PUBLIC_ENDPOINTS = ["/api/market-cap"];

export async function middleware(req: NextRequest) {
  const country = req.geo?.country || "";
  if (PROHIBITED_COUNTRIES.includes(country)) {
    return new Response("Blocked for legal reasons", { status: 451 });
  }

  const path = req.nextUrl.pathname;
  if (path.startsWith("/api/")) {
    if (!["GET", "POST"].includes(req.method)) {
      return _error(401, "method not supported");
    }

    if (PUBLIC_ENDPOINTS.includes(path)) {
      return NextResponse.next();
    }

    const isOk = await isAuthenticated(req);

    if (!isOk) {
      return _error(401, "authentication failed");
    }
  }

  return NextResponse.next();
}

const _error = (status: number, message: string) =>
  new NextResponse(JSON.stringify({ message }), { status });
