import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { createRateLimiter, rateLimit } from "@/lib/rate-limit";

const forgotPasswordRateLimiter = createRateLimiter({
  tokens: 5,
  window: "15 m",
  prefix: "@upstash/ratelimit/auth:forgot-password",
});

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
});

export async function POST(req: NextRequest) {
  const rateLimitResult = await rateLimit(
    req,
    "auth:forgot-password",
    forgotPasswordRateLimiter,
  );
  if (rateLimitResult) {
    return rateLimitResult;
  }

  const { email } = await req.json();
  const validation = formSchema.safeParse({ email });

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Password reset email sent successfully.",
  });
}
