import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, rateLimit } from "@/lib/rate-limit";

const signinRateLimiter = createRateLimiter({
  tokens: 20,
  window: "15 m",
  prefix: "@upstash/ratelimit/auth:signin",
});

export async function POST(req: NextRequest) {
  const rateLimitResult = await rateLimit(req, "auth:login", signinRateLimiter);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const { email, password } = await req.json();

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user, session: data.session });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error occurred" },
      { status: 500 },
    );
  }
}
