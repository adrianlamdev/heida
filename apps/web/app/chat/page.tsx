"use client";

import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import React, { useState, useEffect, useRef } from "react";
import { Loader2, ArrowUp, Paperclip, Copy, Check } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";

// TODO: move to types folder
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CodeBlockProps {
  code: string;
  language: string;
}

// TODO: move this to component folder
const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="relative my-4 bg-muted/20 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center pl-4 py-1 pr-1 border-b bg-muted/20 rounded-t-lg">
        <span className="text-xs font-mono text-muted-foreground">
          {language}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
          onClick={handleCopy}
          disabled={copied}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div>
                <Check className="h-4 w-4" />
                <span className="sr-only">Copied!</span>
              </motion.div>
            ) : (
              <motion.div>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy code</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>

      <div className="p-4">
        <SyntaxHighlighter
          className="!bg-transparent !p-0 !text-sm"
          language={language}
          wrapLongLines
          style={vs2015}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

const MessageContent = ({ content }: { content: string }) => {
  return (
    <motion.div
      className="text-sm w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ ...props }) => <p className="mb-4 last:mb-0" {...props} />,
          a: ({ ...props }) => (
            <a
              className="font-medium underline underline-offset-1 text-muted-foreground hover:text-primary"
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
          ),
          li: ({ ...props }) => <li className="mb-1" {...props} />,
          h1: ({ ...props }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-xl font-bold mb-3 mt-5" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-lg font-bold mb-2 mt-4" {...props} />
          ),
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");

            return match ? (
              <CodeBlock
                code={String(children).replace(/\n$/, "")}
                language={match?.[1] || "text"}
              />
            ) : (
              <code
                className="px-1.5 py-0.5 rounded font-mono text-sm bg-muted/50"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ ...props }) => <pre className="overflow-hidden" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-muted pl-4 my-4 italic text-muted-foreground"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-border" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th
              className="px-4 py-2 bg-muted font-semibold text-left"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td className="px-4 py-2 border-t border-border" {...props} />
          ),
          hr: ({ ...props }) => (
            <hr className="my-6 border-border" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  );
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string | null>(null);
  const [model, setModel] = useState<string>("openai/gpt-3.5-turbo");
  const [showDialog, setShowDialog] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("open_router_api_key");
    const storedModel = localStorage.getItem("openrouter_model_name");
    if (storedApiKey) {
      setOpenRouterApiKey(storedApiKey);
      setShowDialog(false);
    }
    if (storedModel) {
      setModel(storedModel);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          apiKey: openRouterApiKey,
          model: model,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(response.statusText);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.choices?.[0]?.delta?.content) {
              assistantMessage += data.choices[0].delta.content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1]!.content = assistantMessage;
                return newMessages;
              });
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I apologize, but I encountered an error. Please try again.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const apiKey = event.target.value;
    setOpenRouterApiKey(apiKey);
    localStorage.setItem("open_router_api_key", apiKey);
    if (apiKey.trim()) {
      setShowDialog(false);
    }
  };

  return (
    <main className="flex flex-col h-full p-4 pb-8">
      {showDialog && (
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="mb-4">
              <AlertDialogTitle className="text-xl">
                OpenRouter API Key Required
              </AlertDialogTitle>
              <AlertDialogDescription>
                Please provide your OpenRouter API key to continue.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mb-4">
              <Input
                value={openRouterApiKey || ""}
                placeholder="sk-or-..."
                onChange={handleInputChange}
              />
            </div>
            <AlertDialogFooter className="flex justify-end">
              <AlertDialogAction disabled={!openRouterApiKey}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4 h-full w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              <div className="flex items-center gap-4">
                <span className="shrink-0 bg-muted rounded-full p-2 flex items-center justify-center">
                  👋
                </span>
                <h2 className="text-2xl font-bold tracking-tight">
                  Let&apos; get started.
                </h2>
              </div>
              <p>How can I help you today?</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <div key={index} className="max-w-md flex gap-2">
                  <Card
                    className={`p-3 w-full ${
                      message.role === "user"
                        ? "bg-primary/5 border-none"
                        : "bg-card border-border"
                    }`}
                  >
                    <MessageContent content={message.content} />
                  </Card>
                </div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 px-6">
        <div className="max-w-3xl mx-auto flex gap-2">
          <div className="flex-1 flex items-center bg-secondary rounded-full w-full p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary transition-colors rounded-full"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full border-none bg-transparent focus-visible:ring-0 outline-none p-2"
              disabled={isLoading}
            />
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center"
                  disabled={isLoading || !input.trim()}
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>
    </main>
  );
}
