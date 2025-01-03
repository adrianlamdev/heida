import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { createRateLimiter, rateLimit } from "@/lib/rate-limit";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
});

export const resendOtpRateLimiter = createRateLimiter({
  tokens: 1,
  window: "1 m",
  prefix: "@upstash/ratelimit/auth:resend-otp",
});

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimit(
    request,
    "auth:resend-otp",
    resendOtpRateLimiter,
  );
  if (rateLimitResult) return rateLimitResult;

  // TODO: add validation
  const { email } = await request.json();

  const supabase = await createClient();

  try {
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      console.error("OTP Error:", otpError.message);
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
