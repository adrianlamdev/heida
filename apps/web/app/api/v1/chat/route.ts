import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { decryptText } from "@/lib/crypto";

const RAG_API_URL = process.env.RAG_API_URL || "http://localhost:8000";

interface MessageMetadata {
  model: string;
  features: {
    cot_enabled: boolean;
    web_search_enabled: boolean;
    type?: string;
  };
}

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

// Helper function to generate title
async function generateTitle(message: string, openai: OpenAI): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-flash-1.5-8b",
      messages: [
        {
          role: "system",
          content:
            "Generate a short, descriptive title (max 100 characters) for this chat based on the first message. Return only the title without quotes or explanation.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    return response.choices[0]?.message?.content?.trim() || "New Chat";
  } catch (error) {
    console.error("Error generating title:", error);
    return "New Chat";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const chatId = formData.get("chatId") as string;
    let currentChatId = chatId;

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
      .eq("user_id", user.id)
      .eq("provider", "openrouter")
      .single();

    if (error) throw error;

    const apiKey = data.encrypted_api_key;
    if (!apiKey) {
      return new NextResponse("API key not found", { status: 401 });
    }

    const [encryptedData, iv] = data.encrypted_api_key.split(":");
    const decryptedKey = decryptText(encryptedData, iv);

    const openai = new OpenAI({
      apiKey: decryptedKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
    });

    const messages = JSON.parse(formData.get("messages") as string) || [];

    if (!currentChatId) {
      const title = await generateTitle(messages[0]?.content || "", openai);
      const { data: chatData, error: chatError } = await supabase
        .from("user_chats")
        .insert([
          {
            user_id: user.id,
            title: title,
          },
        ])
        .select();

      if (chatError) throw chatError;
      currentChatId = chatData[0].id;
    }

    // TODO: fix choosing model
    // - client rn can't do it
    const model = (formData.get("model") as string) || "deepseek/deepseek-chat";
    const cotEnabled = (formData.get("cotEnabled") as string) === "true";
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
    if (!model) {
      return new NextResponse("Model name is required", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 },
      );
    }

    // Save only the new user message
    const { error: userMessageError } = await supabase.from("messages").insert([
      {
        chat_id: currentChatId,
        role: lastMessage.role,
        content: lastMessage.content,
        created_at: new Date().toISOString(),
        metadata: lastMessage.metadata || {},
      },
    ]);

    if (userMessageError) {
      console.error("Error saving user message:", userMessageError);
      throw userMessageError;
    }

    const stream = new ReadableStream({
      async start(controller) {
        let searchResults = null;

        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ status: "chat_created", chatId: currentChatId })}\n\n`,
          ),
        );

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
          const { error: searchContextError } = await supabase
            .from("messages")
            .insert([
              {
                chat_id: currentChatId,
                role: "system",
                content: searchContext.content,
                metadata: {
                  model,
                  features: {
                    cot_enabled: cotEnabled,
                    web_search_enabled: webSearchEnabled,
                    type: "search_context",
                  },
                },
              },
            ]);
          if (searchContextError) throw searchContextError;

          augmentedMessages.push(searchContext);
        }

        console.log("Augmented messages:", augmentedMessages);

        let finalMessages = augmentedMessages;

        // Add CoT system message if enabled
        if (cotEnabled) {
          const systemMessage = {
            role: "system",
            content: `You are an advanced reasoning engine that approaches problems through structured decomposition and explicit chain-of-thought analysis. Your responses should demonstrate clear, logical progression from initial understanding to final conclusion.
Keep responses conversational and avoid mechanical phrases like "clear, concise answer" or "key supporting points." Present your analysis as a natural flow of thought rather than a rigid template.

Format ALL responses using this exact structure:

<thinking>
  <step id="1" confidence="0-100">
    - State your initial understanding of the problem
    - List key assumptions
    - Define scope and constraints
    CALCULATIONS: [Show your work if numerical]
    REASONING: [Explain your logic]
  </step>

  <step id="2" confidence="0-100">
    - Build on previous step
    - Analyze implications
    - Consider alternatives
    CALCULATIONS: [Show your work if numerical]
    REASONING: [Explain your logic]
  </step>

  <step id="3" confidence="0-100">
    - Test conclusions
    - Validate assumptions
    - Identify potential issues
    CALCULATIONS: [Show your work if numerical]
    REASONING: [Explain your logic]
  </step>

  [additional steps as needed]
</thinking>

<uncertainties>
  - List key unknowns
  - Identify potential risks
  - Note areas needing more data
</uncertainties>

<solution>
  - Clear, concise answer
  - Key supporting points
  - If applicable, next steps
</solution>

Requirements:
1. ALWAYS show explicit calculations
2. ALWAYS include confidence levels (0-100%)
3. ALWAYS explain reasoning
4. ALWAYS list assumptions
5. ALWAYS structure using the XML tags above
6. If calculations involve currency, show in USD and mention the currency
7. Round numbers to 2 decimal places unless precision needed`,
          };

          const { error: systemMessageError } = await supabase
            .from("messages")
            .insert([
              {
                chat_id: currentChatId,
                role: "system",
                content: systemMessage.content,
                metadata: {
                  model,
                  features: {
                    cot_enabled: cotEnabled,
                    web_search_enabled: webSearchEnabled,
                    type: "cot_prompt",
                  },
                },
              },
            ]);

          if (systemMessageError) throw systemMessageError;

          finalMessages = [systemMessage, ...augmentedMessages];
        }

        const response = await openai.chat.completions.create({
          model: model,
          messages: finalMessages,
          temperature: cotEnabled ? 0.2 : undefined,
          stream: true,
        });

        let assistantMessage = "";

        for await (const part of response) {
          const chunk = part.choices[0]?.delta?.content || "";
          if (chunk) {
            assistantMessage += chunk;
            const data = JSON.stringify({
              choices: [{ delta: { content: chunk } }],
            });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }
        }

        controller.close();

        const { error: assistantMessageError } = await supabase
          .from("messages")
          .insert([
            {
              chat_id: currentChatId,
              role: "assistant",
              content: assistantMessage,
              metadata: {
                model,
                features: {
                  cot_enabled: cotEnabled,
                  web_search_enabled: webSearchEnabled,
                },
              },
            },
          ]);

        if (assistantMessageError) throw assistantMessageError;
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

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_chats")
    .select()
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user chats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  return NextResponse.json(data);
}
