import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export const runtime = "edge";

const RAG_API_URL = process.env.RAG_API_URL || "http://localhost:8000";

// Helper function to rewrite search query
async function rewriteSearchQuery(
  query: string,
  openai: OpenAI,
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-flash-1.5-8b",
      messages: [
        {
          role: "system",
          content:
            "Your task is to rewrite the given query to be more search-engine friendly. Extract the key concepts and reformulate them into a clear, concise search query. Return only the rewritten query without any explanation or additional text.",
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.1,
      max_tokens: 100,
    });

    const rewrittenQuery = response.choices[0]?.message?.content?.trim();
    return rewrittenQuery || query;
  } catch (error) {
    console.error("Error rewriting search query:", error);
    return query;
  }
}

// Helper function to determine if web search needed
async function shouldPerformWebSearch(
  messages: any[],
  openai: OpenAI,
): Promise<boolean> {
  try {
    const lastMessage = messages[messages.length - 1]?.content;
    if (!lastMessage) return false;

    const response = await openai.chat.completions.create({
      model: "google/gemini-flash-1.5-8b",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Your task is to determine if the user's query requires current information from the web to provide an accurate and complete response. Respond with 'true' if web search would be beneficial, or 'false' if not. Consider factors like whether the query asks about current events, recent data, or real-time information.",
        },
        {
          role: "user",
          content: lastMessage,
        },
      ],
      temperature: 0.1,
      max_tokens: 5,
    });

    const decision = response.choices[0]?.message?.content?.toLowerCase();
    if (!decision) return false;
    return decision?.includes("true");
  } catch (error) {
    console.error("Error determining web search need:", error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const messages = JSON.parse(formData.get("messages") as string) || [];
    const apiKey = (formData.get("apiKey") as string) || "";
    const model = (formData.get("model") as string) || "";
    const webSearchEnabled =
      (formData.get("webSearchEnabled") as string) === "true";
    const attachments: File[] = [];

    const fileKeys = Array.from(formData.keys()).filter((key) =>
      key.startsWith("attachments"),
    );
    for (const key of fileKeys) {
      const files = formData.getAll(key) as File[];
      attachments.push(...files);
    }

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

    const stream = new ReadableStream({
      async start(controller) {
        let searchResults = null;

        if (webSearchEnabled) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ status: "starting_search" })}\n\n`,
            ),
          );

          const needsWebSearch = await shouldPerformWebSearch(messages, openai);

          if (needsWebSearch) {
            const originalQuery = messages[messages.length - 1]?.content;
            const optimizedQuery = await rewriteSearchQuery(
              originalQuery,
              openai,
            );

            try {
              const searchUrl = `${RAG_API_URL}/api/v1/search?query=${encodeURIComponent(optimizedQuery)}`;

              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ status: "fetching_results" })}\n\n`,
                ),
              );

              const searchResponse = await fetch(searchUrl);

              if (!searchResponse.ok) {
                throw new Error(`Search failed: ${searchResponse.statusText}`);
              }

              const reader = searchResponse.body?.getReader();
              if (!reader) {
                throw new Error("No response body from search API");
              }

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split("\n").filter((line) => line.trim());

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = JSON.parse(line.slice(6));

                    if (data.status) {
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ status: data.status })}\n\n`,
                        ),
                      );
                    }

                    if (data.results) {
                      searchResults = data.results;
                    }
                  }
                }
              }
            } catch (error) {
              console.error("Web search error:", error);
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ error: "Web search failed" })}\n\n`,
                ),
              );
            }
          }
        }

        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ status: "generating" })}\n\n`,
          ),
        );

        const augmentedMessages = [...messages];
        if (searchResults) {
          const searchContext = {
            role: "system",
            content: `Here are relevant search results to help answer the query:\n\n${searchResults
              .map(
                (result: any) =>
                  `Source: ${result.metadata.url}\n${result.content}\n---\n`,
              )
              .join("\n")}`,
          };
          augmentedMessages.push(searchContext);
        }

        console.log("Augmented messages:", augmentedMessages);

        const response = await openai.chat.completions.create({
          model: model,
          messages: augmentedMessages,
          stream: true,
        });

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
  } catch (error) {
    console.error("Chat API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
