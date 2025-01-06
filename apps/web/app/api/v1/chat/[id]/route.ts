import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { OpenAI } from "openai";
import { decryptText } from "@/lib/crypto";
import { z } from "zod";

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

const chatParamsSchema = z.string();

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const id = chatParamsSchema.parse(params.id);
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First fetch the chat to verify ownership
    const { data: chatData, error: chatError } = await supabase
      .from("user_chats")
      .select()
      .eq("user_id", user.id)
      .eq("id", id)
      .single();

    if (chatError || !chatData) {
      return NextResponse.json(
        { error: "Chat not found or unauthorized" },
        { status: 404 },
      );
    }

    // Then fetch all messages for this chat
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", params.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    return NextResponse.json({
      chat: chatData,
      messages: messages,
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const id = chatParamsSchema.parse(params.id);
    const formData = await req.formData();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify chat ownership
    const { data: chatData, error: chatError } = await supabase
      .from("user_chats")
      .select()
      .eq("user_id", user.id)
      .eq("id", id)
      .single();

    if (chatError || !chatData) {
      return NextResponse.json(
        { error: "Chat not found or unauthorized" },
        { status: 404 },
      );
    }

    // Get OpenAI API key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("encrypted_api_key")
      .eq("user_id", user.id)
      .eq("provider", "openrouter")
      .single();

    if (apiKeyError || !apiKeyData?.encrypted_api_key) {
      return NextResponse.json({ error: "API key not found" }, { status: 401 });
    }

    const [encryptedData, iv] = apiKeyData.encrypted_api_key.split(":");
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
    const model = (formData.get("model") as string) || "deepseek/deepseek-chat";
    const webSearchEnabled = formData.get("webSearchEnabled") === "true";
    const cotEnabled = formData.get("cotEnabled") === "true";

    const RAG_API_URL = process.env.RAG_API_URL || "http://localhost:8000";
    let searchResults = null;

    // Handle web search if enabled
    if (webSearchEnabled) {
      const needsWebSearch = await shouldPerformWebSearch(messages, openai);

      if (needsWebSearch) {
        const originalQuery = messages[messages.length - 1]?.content;
        const optimizedQuery = await rewriteSearchQuery(originalQuery, openai);

        try {
          const searchResponse = await fetch(
            `${RAG_API_URL}/api/v1/search?query=${encodeURIComponent(optimizedQuery)}`,
          );

          if (!searchResponse.ok) {
            throw new Error(`Search failed: ${searchResponse.statusText}`);
          }

          searchResults = await searchResponse.json();
        } catch (error) {
          console.error("Web search error:", error);
        }
      }
    }

    let finalMessages = [...messages];

    // Add search context if available
    if (searchResults?.results) {
      const searchContext = {
        role: "system",
        content: `Here are relevant search results to help answer the query:\n\n${searchResults.results
          .map(
            (result: any) =>
              `Source: ${result.metadata.url}\n${result.content}\n---\n`,
          )
          .join("\n")}`,
      };
      finalMessages.push(searchContext);
    }

    // Add CoT system message if enabled
    if (cotEnabled) {
      const systemMessage = {
        role: "system",
        content: `You are an advanced reasoning engine that approaches problems through structured decomposition and explicit chain-of-thought analysis. Your responses should demonstrate clear, logical progression from initial understanding to final conclusion.

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
</solution>`,
      };
      finalMessages = [systemMessage, ...finalMessages];
    }

    // Create stream response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await openai.chat.completions.create({
            model: model,
            messages: messages,
            stream: true,
          });

          let assistantMessage = "";

          for await (const part of response) {
            const chunk = part.choices[0]?.delta?.content || "";
            if (chunk) {
              assistantMessage += chunk;
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    choices: [{ delta: { content: chunk } }],
                  })}\n\n`,
                ),
              );
            }
          }

          // Save the assistant's message
          const { error: messageError } = await supabase
            .from("messages")
            .insert([
              {
                chat_id: id,
                role: "assistant",
                content: assistantMessage,
                metadata: {
                  model,
                  features: {
                    web_search_enabled: webSearchEnabled,
                  },
                },
              },
            ]);

          if (messageError) throw messageError;

          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ status: "completed" })}\n\n`,
            ),
          );
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
