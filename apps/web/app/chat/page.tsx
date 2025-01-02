"use client";

import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";
import "katex/dist/katex.min.css";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import {
  X,
  File,
  Loader2,
  ArrowUp,
  Paperclip,
  Copy,
  Check,
  Search,
} from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
interface ThinkingStepProps {
  id?: string;
  confidence?: string;
  children: React.ReactNode;
}

const ThinkingStep = ({ id, confidence, children }: ThinkingStepProps) => (
  <div className="mb-4 p-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-semibold text-muted-foreground">Step {id}</h3>
      <span className="text-sm text-muted-foreground">
        Confidence: {confidence}%
      </span>
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

const ChainOfThoughtMessage = ({ content }: { content: string }) => {
  // Parse the XML-like structure
  const getSection = (tag: string) => {
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "s");
    const match = content.match(regex);
    return match ? match[1]?.trim() : "";
  };

  const getSteps = () => {
    const stepsRegex = /<step id="(\d+)" confidence="(\d+)">(.*?)<\/step>/gs;
    const steps = [];
    let match;

    while ((match = stepsRegex.exec(content)) !== null) {
      steps.push({
        id: match[1],
        confidence: match[2],
        content: match[3]?.trim(),
      });
    }

    return steps;
  };

  const thinking = getSection("thinking");
  const uncertainties = getSection("uncertainties");
  const solution = getSection("solution");
  const steps = getSteps();

  return (
    <div className="space-y-6">
      {/* Thinking Section */}
      {thinking && (
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-bold">
                Reasoning Process
              </AccordionTrigger>
              <AccordionContent>
                {steps.map((step) => (
                  <ThinkingStep
                    key={step.id}
                    id={step.id}
                    confidence={step.confidence}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="text-muted-foreground text-sm">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                            {children}
                          </ul>
                        ),
                      }}
                    >
                      {step.content}
                    </ReactMarkdown>
                  </ThinkingStep>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* Uncertainties Section */}
      {uncertainties && (
        <div className="p-4 bg-muted/20 rounded-lg">
          <h2 className="text-lg font-bold mb-3">Uncertainties & Risks</h2>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="text-sm text-muted-foreground"
          >
            {uncertainties}
          </ReactMarkdown>
        </div>
      )}

      {/* Solution Section */}
      {solution && (
        <div className="p-4 bg-primary/10 rounded-lg">
          <h2 className="text-lg font-bold mb-3">Solution</h2>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="text-sm font-medium">{children}</p>
              ),
            }}
          >
            {solution}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

// FIXME: currently can't render special properties like \, and [; works for $ and $$
const MessageContent = ({ content }: { content: string }) => {
  const hasChainOfThought =
    content.includes("<thinking>") &&
    content.includes("</thinking>") &&
    content.includes("<solution>");

  return (
    <motion.div
      className="w-full text-sm md:text-base"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {hasChainOfThought ? (
        <ChainOfThoughtMessage content={content} />
      ) : (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[
            [
              rehypeMathjax,
              {
                strict: false,
                throwOnError: false,
                output: "htmlAndMathml",
              },
            ],
          ]}
          components={{
            // FIXME: remove key prop from all components
            p: ({ children, key, ...props }) => (
              <p key={key} className="mb-4 last:mb-0" {...props}>
                {children}
              </p>
            ),
            a: ({ children, key, ...props }) => (
              <a
                key={key}
                className="font-medium underline underline-offset-1 text-muted-foreground hover:text-primary"
                {...props}
              >
                {children}
              </a>
            ),
            ul: ({ children, key, ...props }) => (
              <ul
                key={key}
                className="list-disc pl-6 mb-4 space-y-2"
                {...props}
              >
                {children}
              </ul>
            ),
            ol: ({ children, key, ...props }) => (
              <ol
                key={key}
                className="list-decimal pl-6 mb-4 space-y-2"
                {...props}
              >
                {children}
              </ol>
            ),
            li: ({ children, key, ...props }) => (
              <li key={key} className="mb-1" {...props}>
                {children}
              </li>
            ),
            h1: ({ children, key, ...props }) => (
              <h1 key={key} className="text-2xl font-bold mb-4 mt-6" {...props}>
                {children}
              </h1>
            ),
            h2: ({ children, key, ...props }) => (
              <h2 key={key} className="text-xl font-bold mb-3 mt-5" {...props}>
                {children}
              </h2>
            ),
            h3: ({ children, key, ...props }) => (
              <h3 key={key} className="text-lg font-bold mb-2 mt-4" {...props}>
                {children}
              </h3>
            ),
            code: ({ className, children, key, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const isMath =
                className?.includes("math-inline") ||
                className?.includes("math-display") ||
                className?.includes("language-math");

              if (isMath) {
                return <span className="katex-wrapper">{children}</span>;
              }

              return match ? (
                <CodeBlock
                  key={key}
                  code={String(children).replace(/\n$/, "")}
                  language={match[1] || "text"}
                />
              ) : (
                <code
                  key={key}
                  className="px-1.5 py-0.5 rounded font-mono text-sm bg-muted/50"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            blockquote: ({ children, key, ...props }) => (
              <blockquote
                key={key}
                className="border-l-4 border-muted pl-4 my-4 italic text-muted-foreground"
                {...props}
              >
                {children}
              </blockquote>
            ),
            table: ({ children, key, ...props }) => (
              <div key={key} className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-border" {...props}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children, key, ...props }) => (
              <th
                key={key}
                className="px-4 py-2 bg-muted font-semibold text-left"
                {...props}
              >
                {children}
              </th>
            ),
            td: ({ children, key, ...props }) => (
              <td
                key={key}
                className="px-4 py-2 border-t border-border"
                {...props}
              >
                {children}
              </td>
            ),
            hr: ({ key, ...props }) => (
              <hr key={key} className="my-6 border-border" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      )}
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
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [fileAttachmentReset, setFileAttachmentReset] = useState(false);

  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleFileRemove = (index: number) => {
    setAttachedFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const resetFileAttachment = () => {
    setFileAttachmentReset((prev) => !prev);
  };

  // FIX: not safe to use localStorage to store API key
  // - encrypt and save or
  // - use a server to store and retrieve
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
    // NOTE: maybe remove this since it's annoying? will survey
    //messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (fileAttachmentReset) {
      setAttachedFiles([]);
      setFileAttachmentReset(false);
    }
  }, [fileAttachmentReset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    try {
      setIsLoading(true);

      abortControllerRef.current = new AbortController();

      const userMessage: Message = {
        role: "user",
        content: input.trim(),
      };

      console.log("User message:", userMessage);

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      resetFileAttachment();

      const formData = new FormData();
      formData.append("messages", JSON.stringify([...messages, userMessage]));
      formData.append("apiKey", openRouterApiKey || "");
      formData.append("model", model || "");
      formData.append("webSearchEnabled", webSearchEnabled.toString());
      attachedFiles.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      const response = await fetch("/api/v1/chat", {
        method: "POST",
        body: formData,
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
      console.log("handleSubmit completed");
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
    <main className="flex flex-col h-full relative items-center justify-center">
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

      <div className="flex-1 overflow-y-auto w-full">
        <div className="h-full flex flex-col">
          <div className="max-w-3xl mx-auto w-full px-4 flex-1 pb-28 md:pb-36">
            {messages.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center flex-col gap-2">
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
                <div className="mt-10 flex flex-col gap-4">
                  {messages.map((message, index) => (
                    <Card
                      key={index}
                      className={`p-4 w-full rounded-2xl shadow ${
                        message.role === "user"
                          ? "bg-secondary/80 shadow-inner"
                          : "bg-card border-border"
                      }`}
                    >
                      <MessageContent content={message.content} />
                    </Card>
                  ))}
                </div>
              </AnimatePresence>
            )}
            <div className="fixed bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-4 md:bottom-6 left-0 right-0 max-w-3xl mx-auto px-4 z-10 rounded-full mb-4"
      >
        <div className="max-w-3xl mx-auto flex gap-2 w-full">
          <div className="flex-1 flex items-center bg-secondary/80 transition-colors focus-within:bg-secondary rounded-full w-full p-1 pl-2 relative border shadow-lg gap-2">
            <div className="flex flex-col">
              <div className="flex items-center">
                {/* <Button */}
                {/*   size="icon" */}
                {/*   variant="ghost" */}
                {/*   className="w-8 h-8 shrink-0 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-transparent" */}
                {/* > */}
                {/*   <MoreVertical className="h-5 w-5" /> */}
                {/* </Button> */}

                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handlePaperclipClick}
                  className="w-8 h-8 shrink-0 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-transparent"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={`h-8 px-2 py-1 rounded-full flex items-center gap-2 hover:bg-transparent ${
                    webSearchEnabled
                      ? "bg-background hover:bg-background/50"
                      : "text-muted-foreground"
                  }`}
                >
                  <Search className={`h-5 w-5 ${webSearchEnabled ? "" : ""}`} />
                  <span>Web Search</span>
                </Button>
              </div>

              {attachedFiles.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 w-full bg-background rounded-lg p-2 border shadow-lg">
                  <div className="flex flex-col gap-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg px-2 py-1 border bg-secondary/50"
                      >
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[200px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          className="text-muted-foreground hover:bg-transparent"
                          onClick={() => handleFileRemove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={
                attachedFiles.length > 0
                  ? "Add a message..."
                  : "Type a message..."
              }
              className="w-full border-none bg-transparent focus-visible:ring-0 outline-none p-2 h-10 text-[1rem] placeholder:text-[0.9rem]"
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
                  disabled={
                    isLoading || (!input.trim() && attachedFiles.length === 0)
                  }
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
