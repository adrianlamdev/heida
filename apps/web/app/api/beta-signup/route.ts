import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// TODO: move to a shared schema
const signupSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    const supabase = await createClient();

    const { error } = await supabase.from("beta_signups").upsert({
      email: validatedData.email,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: "Successfully joined the beta waitlist" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Beta signup error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    if ((error as { code?: string })?.code === "23505") {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to join waitlist. Please try again later." },
      { status: 500 },
    );
  }
}
