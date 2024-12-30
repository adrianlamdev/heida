import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, apiKey, model, stream = false } = await req.json();

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
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
    });

    if (stream) {
      const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          for await (const part of response) {
            const chunk = part.choices[0]?.delta?.content || "";
            if (chunk) {
              const data = JSON.stringify({
                choices: [{ delta: { content: chunk } }],
              });
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
      });

      const data =
        response.choices[0]?.message?.content?.trim() || "No response";
      return NextResponse.json({ data });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
