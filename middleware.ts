import { rateLimit } from "express-rate-limit";
import { NextResponse, NextRequest } from "next/server";

import { isAuthenticated } from "./lib/auth";
import { PROHIBITED_COUNTRIES } from "./lib/config";

export async function middleware(req: NextRequest, res: NextResponse) {
  try {
    await applyMiddleware(limiter)(req, res);
  } catch (er) {
    return new Response("Too many requests!", { status: 429 });
  }

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

const applyMiddleware =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (middleware: any) => (request: NextRequest, response: NextResponse) =>
    new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      middleware(request, response, (result: any) =>
        result instanceof Error ? reject(result) : resolve(result)
      );
    });

const getIP = (request: NextRequest) =>
  request.ip ||
  request.headers.get("x-forwarded-for") ||
  request.headers.get("x-real-ip")!;

const limiter = rateLimit({
  keyGenerator: getIP,
  windowMs: 5 * 1000, // 5 seconds
  max: 200, // Limit each IP to 200 requests per `window`
  legacyHeaders: false,
  handler: () => {
    throw new Error();
  },
});
