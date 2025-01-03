import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const { email, otp, next = "/chat" } = await request.json();
  console.log(email, otp);

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.auth.updateUser({
    data: { email_verified: true },
  });

  return NextResponse.json({
    success: true,
    redirectTo: next,
  });
}
