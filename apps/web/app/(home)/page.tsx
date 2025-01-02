import React from "react";
import { BackgroundBeams } from "@/components/background-beams";
import { TextGenerateEffect } from "@/components/text-generate-effect";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";
import {
  Card,
  CardContainer,
  CardDescription,
  CardTitle,
} from "@/components/feature-card";
import { HoverBorderGradient } from "@/components/hover-border-gradient";
import { Button } from "@workspace/ui/components/button";
import { CardHeader, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import {
  ArrowRight,
  FileText,
  Search,
  Code2,
  RefreshCw,
  Sparkles,
  Command,
  Wand2,
  Bot,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const ClaudeLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      imageRendering="optimizeQuality"
      fillRule="evenodd"
      clipRule="evenodd"
      viewBox="0 0 512 512"
      className={className}
    >
      <rect fill="#CC9B7A" width="512" height="512" rx="104.187" ry="105.042" />
      <path
        fill="#1F1F1E"
        fillRule="nonzero"
        d="M318.663 149.787h-43.368l78.952 212.423 43.368.004-78.952-212.427zm-125.326 0l-78.952 212.427h44.255l15.932-44.608 82.846-.004 16.107 44.612h44.255l-79.126-212.427h-45.317zm-4.251 128.341l26.91-74.701 27.083 74.701h-53.993z"
      />
    </svg>
  );
};

const GitHubLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
        fill="currentColor"
      />
    </svg>
  );
};

const GeminiLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={className}
    >
      <path
        d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z"
        fill="url(#prefix__paint0_radial_980_20147)"
      />
      <defs>
        <radialGradient
          id="prefix__paint0_radial_980_20147"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)"
        >
          <stop offset=".067" stopColor="#9168C0" />
          <stop offset=".343" stopColor="#5684D1" />
          <stop offset=".672" stopColor="#1BA1E3" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export default function Page() {
  return (
    <main className="min-h-screen bg-background antialiased" id="hero">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="relative z-10 px-4 text-center">
          <div className="space-y-6 max-w-4xl mx-auto flex flex-col items-center">
            <div className="flex justify-center">
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-1.5 text-sm border border-primary/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                <span className="bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text font-medium">
                  Now in Private Beta
                </span>
              </div>
            </div>

            <div className="relative">
              <TextGenerateEffect
                words="Your Command Center for AI Interactions"
                className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text"
              />
            </div>

            <p className="text-xl text-white/70 max-w-2xl">
              One elegant interface unifying OpenRouter models, Claude, and
              GPT-4o. With real-time file collaboration, contextual memory, and
              powerful markdown support.
            </p>

            <div className="pt-6 flex gap-4 justify-center items-center max-w-lg w-full">
              <Input
                placeholder="you@example.com"
                className="flex-1 h-10 bg-background/50 border-primary/20 backdrop-blur-sm"
              />
              <Button size="lg" className="h-10 group px-3">
                Join Beta
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
        <BackgroundBeams className="opacity-30" />
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-background relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContainer>
                <div className="flex items-center justify-center h-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Command className="h-8 w-8 text-primary" />
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Wand2 className="h-8 w-8 text-primary" />
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContainer>
              <CardTitle>Universal AI Control</CardTitle>
              <CardDescription>
                Seamlessly switch between AI models while maintaining context
                and conversation history.
              </CardDescription>
            </Card>

            <Card>
              <CardContainer>
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <ClaudeLogo className="h-6 w-6 text-primary" />
                    </div>
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <GitHubLogo className="h-8 w-8 text-primary" />
                    </div>
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <GeminiLogo className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContainer>
              <CardTitle>Powerful Integrations</CardTitle>
              <CardDescription>
                Seamlessly switch between AI models while maintaining context
                and conversation history.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Features Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center justify-between">
            <div className="space-y-8 flex-1">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-white/70 text-transparent bg-clip-text">
                Built for Power Users
              </h2>

              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-6">
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Code2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        Rich Code Support
                      </h3>
                      <p className="text-muted-foreground">
                        Syntax highlighting for 100+ programming languages with
                        inline execution
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary text-lg font-semibold">
                        ∑
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        Mathematical Precision
                      </h3>
                      <p className="text-muted-foreground">
                        Full LaTeX support with real-time rendering and
                        computational capabilities
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <RefreshCw className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        Real-time Collaboration
                      </h3>
                      <p className="text-muted-foreground">
                        Stream responses with markdown rendering and multi-user
                        support
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="relative overflow-hidden border-primary/20 flex-1 max-w-xl">
              <CardHeader className="border-b border-primary/10 bg-background">
                <div className="flex items-center gap-2 absolute top-4 left-4">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
              </CardHeader>
              <CardContent className="p-6 font-mono text-sm bg-background">
                <div className="text-muted-foreground space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{">"}</span>
                    <span className="text-white">
                      Calculate the integral of e^x:
                    </span>
                  </div>
                  <div className="mt-2 bg-primary/5 p-4 rounded-md border border-primary/10">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeMathjax]}
                    >
                      {"$$ \\int e^x dx = e^x + C $$"}
                    </ReactMarkdown>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{">"}</span>
                    <span className="text-white/70">Plotting function...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="relative py-24 px-4 bg-background">
        <div className="max-w-xl mx-auto text-center space-y-8 flex flex-col items-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-white/70 text-transparent bg-clip-text">
            Join the Waitlist
          </h2>
          <p className="text-lg text-muted-foreground">
            Be among the first to experience the future of AI interaction.
            Limited spots available for our private beta.
          </p>
          <div className="flex gap-4 justify-center items-center max-w-lg">
            <Input
              placeholder="you@example.com"
              className="flex-1 h-10 bg-background/50 border-primary/20 backdrop-blur-sm"
            />
            <Button size="lg" className="h-10 group px-3">
              Join Beta
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
