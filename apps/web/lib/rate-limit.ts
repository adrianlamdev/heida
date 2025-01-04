import { type Duration, Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const redis = Redis.fromEnv();

interface RateLimitOptions {
  tokens: number;
  window: Duration;
  analytics?: boolean;
  prefix?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(options.tokens, options.window),
    analytics: options.analytics ?? true,
    prefix: options.prefix ?? "@upstash/ratelimit",
  });
}

export async function rateLimit(
  req: NextRequest,
  identifier: string,
  rateLimiter: Ratelimit,
) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  if (process.env.NODE_ENV === "development") {
    console.log(`Rate limiting ${identifier}:${ip}`);
    return null;
  }

  const { success, reset, limit, remaining } = await rateLimiter.limit(
    `${identifier}:${ip}`,
  );

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        retryAfter: reset - Date.now(),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      },
    );
  }

  return null;
}
