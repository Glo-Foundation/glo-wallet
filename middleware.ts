import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

import { isAuthenticated } from "./lib/auth";
import { PROHIBITED_COUNTRIES } from "./lib/config";

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

    const isOk = await isAuthenticated(req);

    if (!isOk) {
      return _error(401, "authentication failed");
    }
  }
}

const _error = (status: number, message: string) =>
  new NextResponse(JSON.stringify({ message }), { status });
