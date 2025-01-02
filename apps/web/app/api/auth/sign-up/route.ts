import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export async function POST(request: NextRequest) {
  // TODO: add validation
  const { email, password } = await request.json();

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  console.log("signUpData", signUpData);

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  if (signUpData.user) {
    await supabase.auth.updateUser({
      data: {
        email_verified: false,
      },
    });

    return NextResponse.json({
      success: true,
      requiresVerification: true,
    });
  }

  return NextResponse.json({ success: true });
}
