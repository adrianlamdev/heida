"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, ArrowUp, Paperclip } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { motion, AnimatePresence } from "framer-motion";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MessageContent = ({ content }: { content: string }) => {
  // TODO: Re-enable animation when streaming is implemented
  // return (
  //   <motion.p className="text-sm whitespace-pre-wrap w-full">
  //     <AnimatePresence mode="popLayout">
  //       {content.split("").map((char, index) => (
  //         <motion.span
  //           key={index}
  //           initial={{ opacity: 0 }}
  //           animate={{ opacity: 1 }}
  //           transition={{
  //             duration: 0.5,
  //             delay: index * 0.02,
  //           }}
  //           style={{ display: "inline-block", whiteSpace: "pre" }}
  //         >
  //           {char}
  //         </motion.span>
  //       ))}
  //     </AnimatePresence>
  //   </motion.p>
  // );
  return <p className="text-sm whitespace-pre-wrap w-full">{content}</p>;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string | null>(null);
  const [model, setModel] = useState<string>("deepseek/deepseek-chat");
  const [showDialog, setShowDialog] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage),
          apiKey: openRouterApiKey,
          model: model,
        }),
      });

      if (!response.ok) throw new Error(response.statusText);

      const data = await response.json();

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = data.data;
        return newMessages;
      });
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const apiKey = event.target.value;
    setOpenRouterApiKey(apiKey);
    localStorage.setItem("open_router_api_key", apiKey);
    if (apiKey.trim()) {
      setShowDialog(false);
    }
  };

  const handleModelChange = (event) => {
    const modelName = event.target.value;
    setModel(modelName);
    localStorage.setItem("openrouter_model_name", modelName);
  };

  return (
    <main className="flex flex-col h-full p-4 pb-8">
      {/* Alert Dialog */}
      {showDialog && (
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="mb-4">
              <AlertDialogTitle className="text-xl">
                No Open Router API Key
              </AlertDialogTitle>
              <AlertDialogDescription>
                In order to use this chat, you need to provide an Open Router
                API key.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mb-4">
              <Input
                value={openRouterApiKey || ""}
                placeholder="sk-..."
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
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4 h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              <div className="flex items-center gap-4">
                <span className="shrink-0 bg-muted rounded-full p-2 flex items-center justify-center">
                  👋
                </span>
                <h2 className="text-2xl font-bold tracking-tight">
                  Hi, I'm Ada.
                </h2>
              </div>
              <p>How can I help you today?</p>
            </div>
          ) : (
            // TODO: Re-enable AnimatePresence when streaming is implemented
            // <AnimatePresence mode="popLayout">
            <>
              {messages.map((message, index) => (
                <div key={index} className="max-w-md flex gap-2">
                  <Card
                    className={`p-3 w-full ${
                      message.role === "user"
                        ? "bg-primary/5 border-none"
                        : "bg-secondary"
                    }`}
                  >
                    <MessageContent content={message.content} />
                  </Card>
                </div>
              ))}
            </>
            /* </AnimatePresence> */
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="mt-4 px-6">
        <div className="max-w-3xl mx-auto flex gap-2">
          <div className="flex-1 flex items-center bg-secondary rounded-full w-full p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-primary transition-colors rounded-full"
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
            {/* <AnimatePresence mode="wait"> */}
            {isLoading ? (
              <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center"
                disabled={isLoading || !input.trim()}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            )}
            {/* </AnimatePresence> */}
            {/* TODO: Re-enable AnimatePresence when streaming is implemented */}
          </div>
        </div>
      </form>
    </main>
  );
}
