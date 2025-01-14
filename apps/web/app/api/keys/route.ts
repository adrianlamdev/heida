import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { keySchema } from "@/schemas/key";
import { encryptText } from "@/lib/crypto";

const keyValidation = {
  openai: (key: string) => key.startsWith("sk-") && key.length >= 40,
  anthropic: (key: string) => key.startsWith("sk-ant-") && key.length >= 40,
  openrouter: (key: string) => key.startsWith("sk-or-") && key.length >= 40,
} as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = keySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    const { key, type } = validation.data;

    if (!keyValidation[type]?.(key)) {
      return NextResponse.json(
        {
          error: `Invalid ${type} key format`,
        },
        { status: 400 },
      );
    }

    // Encrypt the API key
    const encryptedKey = encryptText(key);

    const combinedEncryptedData = `${encryptedKey.encryptedData}:${encryptedKey.iv}`;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { error } = await supabase.from("api_keys").upsert(
      {
        user_id: user.id,
        encrypted_api_key: combinedEncryptedData,
        provider: type,
      },
      {
        onConflict: "user_id, provider",
      },
    );

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "API key saved successfully.",
    });
  } catch (error) {
    console.error("Error saving key:", error);
    return NextResponse.json({ error: "Failed to save key" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("api_keys")
      .select("encrypted_api_key, provider")
      .eq("user_id", user.id);

    if (error) throw error;

    const transformedData = data?.reduce((acc, key) => {
      return {
        ...acc,
        [key.provider]: true,
      };
    }, {});

    return NextResponse.json({ keys: transformedData });
  } catch (error) {
    console.error("Error fetching keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch keys" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type || !["openai", "anthropic", "openrouter"].includes(type)) {
      return NextResponse.json({ error: "Invalid key type" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", type);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "API key deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting key:", error);
    return NextResponse.json(
      { error: "Failed to delete key" },
      { status: 500 },
    );
  }
}
