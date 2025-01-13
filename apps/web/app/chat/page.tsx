"use client";

import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";
import CommandMenu from "@/components/command-menu";
import "katex/dist/katex.min.css";
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
import { TextShimmer } from "@/components/text-shimmer";
import FileUploadHandler from "@/components/file-upload-handler";

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
    <div className="relative my-4 bg-muted/20 rounded-lg border">
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
// interface ThinkingStepProps {
//   id?: string;
//   confidence?: string;
//   children: React.ReactNode;
// }
//
// const ThinkingStep = ({ id, confidence, children }: ThinkingStepProps) => (
//   <div className="mb-4 p-4">
//     <div className="flex justify-between items-center mb-2">
//       <h3 className="font-semibold text-muted-foreground">Step {id}</h3>
//       <span className="text-sm text-muted-foreground">
//         Confidence: {confidence}%
//       </span>
//     </div>
//     <div className="space-y-2">{children}</div>
//   </div>
// );
//
// const ChainOfThoughtMessage = ({ content }: { content: string }) => {
//   // Parse the XML-like structure
//   const getSection = (tag: string) => {
//     const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "s");
//     const match = content.match(regex);
//     return match ? match[1]?.trim() : "";
//   };
//
//   const getSteps = () => {
//     const stepsRegex = /<step id="(\d+)" confidence="(\d+)">(.*?)<\/step>/gs;
//     const steps = [];
//     let match;
//
//     while ((match = stepsRegex.exec(content)) !== null) {
//       steps.push({
//         id: match[1],
//         confidence: match[2],
//         content: match[3]?.trim(),
//       });
//     }
//
//     return steps;
//   };
//
//   const thinking = getSection("thinking");
//   const uncertainties = getSection("uncertainties");
//   const solution = getSection("solution");
//   const steps = getSteps();
//
//   return (
//     <div className="space-y-6">
//       {/* Thinking Section */}
//       {thinking && (
//         <div className="space-y-4">
//           <Accordion type="single" collapsible className="w-full">
//             <AccordionItem value="item-1">
//               <AccordionTrigger className="text-lg font-bold">
//                 Reasoning Process
//               </AccordionTrigger>
//               <AccordionContent>
//                 {steps.map((step) => (
//                   <ThinkingStep
//                     key={step.id}
//                     id={step.id}
//                     confidence={step.confidence}
//                   >
//                     <ReactMarkdown
//                       remarkPlugins={[remarkGfm]}
//                       components={{
//                         p: ({ children }) => (
//                           <p className="text-muted-foreground text-sm">
//                             {children}
//                           </p>
//                         ),
//                         ul: ({ children }) => (
//                           <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
//                             {children}
//                           </ul>
//                         ),
//                       }}
//                     >
//                       {step.content}
//                     </ReactMarkdown>
//                   </ThinkingStep>
//                 ))}
//               </AccordionContent>
//             </AccordionItem>
//           </Accordiona>
//         </div>
//       )}
//
//       {/* Uncertainties Section */}
//       {uncertainties && (
//         <div className="p-4 bg-muted/20 rounded-lg">
//           <h2 className="text-lg font-bold mb-3">Uncertainties & Risks</h2>
//           <ReactMarkdown
//             remarkPlugins={[remarkGfm]}
//             className="text-sm text-muted-foreground"
//           >
//             {uncertainties}
//           </ReactMarkdown>
//         </div>
//       )}
//
//       {/* Solution Section */}
//       {solution && (c
//         <div className="p-4 bg-primary/10 rounded-lg">
//           <h2 className="text-lg font-bold mb-3">Solution</h2>
//           <ReactMarkdown
//             remarkPlugins={[remarkGfm]}
//             components={{
//               p: ({ cehildren }) => (
//                 <p className="text-sm font-medium">{children}</p>
//               ),
//             }}
//           >
//             {solution}
//           </ReactMarkdown>
//         </div>
//       )}
//     </div>
//   );
// };

const STATUS_MESSAGES: { [key: string]: string } = {
  // Search phase
  starting_search: "Preparing web search...",
  searching: "Searching the web for relevant information...",
  found_results: "Found relevant sources...",

  // Processing phase
  indexing: "Processing search results...",
  fetched: "Organizing information...",
  fetching_results: "Retrieving detailed information...",

  // Generation phase
  running_rag: "Analyzing context...",
  completed: "",
};

interface StatusMessageProps {
  status: string;
  visible: boolean;
}

const StatusMessage = ({ status, visible }: StatusMessageProps) => {
  const message = STATUS_MESSAGES[status] || "Processing your request...";

  return (
    <AnimatePresence>
      {visible && status && status !== "completed" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute flex items-center justify-center z-50 pointer-events-none -top-12 left-1/3"
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/70 border backdrop-blur-sm shadow-inner text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <TextShimmer className="font-medium text-sm" duration={1.5}>
              {message}
            </TextShimmer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// FIXME: currently can't render special properties like \, and [; works for $ and $$
const MessageContent = ({ content }: { content: string }) => {
  // const hasChainOfThought =
  //   content.includes("<thinking>") &&
  //   content.includes("</thinking>") &&
  //   content.includes("<solution>");

  return (
    <motion.div
      className="w-full text-sm md:text-base"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* {hasChainOfThought ? ( */}
      {/*   <ChainOfThoughtMessage content={content} /> */}
      {/* ) : ( */}
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
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          a: ({ children, href }) => (
            <a
              href={href}
              className="font-medium underline underline-offset-1 text-muted-foreground hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-1">{children}</li>,
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>
          ),
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isMath =
              className?.includes("math-inline") ||
              className?.includes("math-display") ||
              className?.includes("language-math");

            if (isMath) {
              return (
                <span className="katex-wrapper">
                  {String(children).replace(/\n$/, "")}
                </span>
              );
            }

            return match ? (
              <CodeBlock
                code={String(children).replace(/\n$/, "")}
                language={match[1] || "text"}
              />
            ) : (
              <code className="px-1.5 py-0.5 rounded font-mono text-sm bg-muted/50">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted pl-4 my-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-border">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 bg-muted font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border-t border-border">{children}</td>
          ),
          hr: () => <hr className="my-6 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
      {/* )} */}
    </motion.div>
  );
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<string>("");
  const [chatId, setChatId] = useState("");
  const [showDialog, setShowDialog] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [chatFiles, setChatFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value == "/") {
      console.log("show command menu");
      setShowCommandMenu(true);
    } else if (!value.startsWith("/")) {
      setShowCommandMenu(false);
    }
  };

  const handleCommandSelect = (command) => {
    setInput(command.template);
  };

  // const fileInputRef = useRef<HTMLInputElement>(null);

  // const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!event.target.files) return;
  //   const files = Array.from(event.target.files);
  //   setAttachedFiles((prev) => [...prev, ...files]);
  // };
  //
  // const handleFileRemove = (index: number) => {
  //   setAttachedFiles((prev) => {
  //     const newFiles = [...prev];
  //     newFiles.splice(index, 1);
  //     return newFiles;
  //   });
  // };
  //
  // const handlePaperclipClick = () => {
  //   fileInputRef.current?.click();
  // };
  //
  // const resetFileAttachment = () => {
  //   setFileAttachmentReset((prev) => !prev);
  // };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // useEffect(() => {
  //   if (fileAttachmentReset) {
  //     setAttachedFiles([]);
  //     setFileAttachmentReset(false);
  //   }
  // }, [fileAttachmentReset]);

  const handleFileUploaded = (uploadedFile) => {
    setChatFiles((prev) => [...prev, uploadedFile]);
  };

  const handleFileRemoved = (removedFile) => {
    setChatFiles((prev) => prev.filter((file) => file.id !== removedFile.id));
  };

  const handleSubmit = async (
    e: React.FormEvent | null,
    recommendedPrompt?: string,
  ) => {
    if (e) e.preventDefault();
    const currentInput = recommendedPrompt || input;
    if ((!currentInput.trim() && chatFiles.length === 0) || isLoading) return;

    try {
      setIsLoading(true);
      setShowStatus(true);
      setStatus("");

      abortControllerRef.current = new AbortController();

      const userMessage: Message = {
        role: "user",
        content: recommendedPrompt || input.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const formData = new FormData();
      formData.append("chatId", chatId || "");
      formData.append("messages", JSON.stringify([...messages, userMessage]));
      formData.append("model", model || "");
      formData.append("webSearchEnabled", webSearchEnabled.toString());

      if (chatFiles.length > 0) {
        formData.append(
          "fileIds",
          JSON.stringify(chatFiles.map((file) => file.id)),
        );
      }

      const response = await fetch("/api/v1/chat", {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(response.statusText);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.status) {
              if (data.status === "chat_created" && data.chatId) {
                setChatId(data.chatId);
                window.history.replaceState({}, "", `/chat/${data.chatId}`);
              }
              if (data.status === "completed") {
                setStatus("");
                setShowStatus(false);
                break;
              }
              setStatus(data.status);
            }

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
      setStatus("");
      setShowStatus(false);
      abortControllerRef.current = null;
    }
  };

  const recommendedPrompts = [
    "What can you do?",
    "Write an email to my students",
    "Explain [topic] in simple terms.",
    "Tell me a fun fact!",
  ];

  return (
    <main className="flex flex-col h-full relative items-center justify-center">
      <div className="flex-1 overflow-y-auto w-full">
        <div className="h-full flex flex-col">
          <div className="max-w-3xl mx-auto w-full px-4 flex-1 pb-28 md:pb-36">
            {messages.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center flex-col gap-10">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Let&apos; get started.
                  </h2>
                  <p>How can I help you today?</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  {recommendedPrompts.map((prompt, i) => (
                    <Button
                      key={i}
                      variant="secondary"
                      className="w-full h-20 bg-secondary/60 border shadow-inner"
                      onClick={() => handleSubmit(null, prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
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
        <div className="max-w-3xl w-full">
          <div className="flex-1 flex justify-between items-center bg-secondary/80 transition-colors focus-within:bg-secondary rounded-full w-full p-1 pl-2 relative border shadow-lg">
            <div className="flex items-center gap-2 w-full flex-1">
              <StatusMessage status={status} visible={showStatus} />
              <div className="flex flex-col">
                <div className="flex items-center w-full">
                  {/* <Button */}
                  {/*   size="icon" */}
                  {/*   variant="ghost" */}
                  {/*   className="w-8 h-8 shrink-0 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-transparent" */}
                  {/* > */}
                  {/*   <MoreVertical className="h-5 w-5" /> */}
                  {/* </Button> */}

                  {/* <Input */}
                  {/*   type="file" */}
                  {/*   ref={fileInputRef} */}
                  {/*   onChange={handleFileSelect} */}
                  {/*   className="hidden" */}
                  {/*   multiple */}
                  {/* /> */}
                  {/**/}
                  {/* <Button */}
                  {/*   type="button" */}
                  {/*   variant="ghost" */}
                  {/*   size="icon" */}
                  {/*   onClick={handlePaperclipClick} */}
                  {/*   className="w-8 h-8 shrink-0 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-transparent" */}
                  {/* > */}
                  {/*   <Paperclip className="h-5 w-5" /> */}
                  {/* </Button> */}

                  <FileUploadHandler
                    onFileUpload={handleFileUploaded}
                    onFileRemove={handleFileRemoved}
                    onUploadStateChange={setIsUploading}
                    chatId={chatId}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                    className={`h-8 px-2 py-1 rounded-full flex items-center gap-2 hover:bg-transparent 
${
  webSearchEnabled
    ? "bg-background/50 hover:bg-background/60"
    : "text-muted-foreground"
}`}
                  >
                    <Search
                      className={`h-5 w-5 ${webSearchEnabled ? "" : ""}`}
                    />
                    <span>Web Search</span>
                    {webSearchEnabled && <X className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-w-0 relative">
                <CommandMenu
                  isOpen={showCommandMenu}
                  onSelect={handleCommandSelect}
                  onClose={() => setShowCommandMenu(false)}
                />
                <Input
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={isUploading}
                  placeholder={
                    chatFiles.length > 0
                      ? "Ask about files, or use / for commands, @ for presets..."
                      : "Type / for commands, @ for presets..."
                  }
                  className="shadow-none w-full border-none focus:bg-transparent hover:bg-transparent bg-transparent focus-visible:ring-0 outline-none p-2 h-10 text-[1rem] placeholder:text-[0.9rem]"
                />
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={isLoading ? "loading" : "idle"}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="button"
                  size="icon"
                  className="h-8 w-8 rounded-full flex items-center justify-center"
                  disabled={
                    isUploading ||
                    (!isLoading && !input.trim() && chatFiles.length === 0)
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    if (isLoading) {
                      if (abortControllerRef.current) {
                        abortControllerRef.current.abort();
                        setIsLoading(false);
                        setStatus("");
                        setShowStatus(false);
                      }
                    } else {
                      handleSubmit(e);
                    }
                  }}
                >
                  {isLoading ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <ArrowUp className="h-5 w-5" />
                  )}
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </form>
    </main>
  );
}
