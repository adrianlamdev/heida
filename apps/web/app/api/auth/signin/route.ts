import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    return NextResponse.json(
      {
        message: "Signin successful",
        user: data.user,
        session: data.session,
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Server error occurred" },
      { status: 500 },
    );
  }
}
