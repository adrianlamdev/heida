import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, apiKey, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    if (!apiKey) {
      return new NextResponse("API key is required", { status: 400 });
    }

    if (!model) {
      return new NextResponse("Model name is required", { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1/",
    });

    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
    });

    console.log("OpenRouter response:", response);

    const data = response.choices[0]?.message?.content!.trim() || "No response";

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Chat API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
