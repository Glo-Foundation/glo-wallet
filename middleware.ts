import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

import { isAuthenticated } from "./lib/auth";

export async function middleware(req: NextRequest) {
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
