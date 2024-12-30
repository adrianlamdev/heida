import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Simulate streaming response (replace with actual AI service)
    const sendChunk = async (chunk: string) => {
      await writer.write(encoder.encode(chunk));
    };

    const streamResponse = async () => {
      try {
        const response =
          "This is a simulated streaming response. Replace with your AI service integration.";
        for (const char of response) {
          await sendChunk(char);
          // Simulate streaming delay
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (error) {
        console.error("Streaming error:", error);
      } finally {
        await writer.close();
      }
    };

    streamResponse();

    return new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
