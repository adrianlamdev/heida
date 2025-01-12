import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { ChevronRight, Check, Minus } from "lucide-react";
import React from "react";

export default function PricingPage() {
  const features = [
    {
      name: "AI Model Support",
      description:
        "Connect your OpenRouter API key to access 20+ AI models including GPT-4, Claude, and more.",
      free: true,
      pro: true,
    },
    {
      name: "Projects",
      description:
        "Create separate workspaces for different use cases - personal, work, research, or learning",
      free: "2 projects",
      pro: "Unlimited",
    },
    {
      name: "Core Features",
      description:
        "Interactive coding environment, LaTeX math rendering, data visualization, and basic file sharing capabilities",
      free: true,
      pro: true,
    },
    {
      name: "Chat Export & Sharing",
      description: "Export or share your chat history with others.",
      free: true,
      pro: true,
    },
    {
      name: "History",
      description:
        "Access your chat history, including code snippets, files, and generated content",
      free: "7 days",
      pro: "Unlimited",
    },
    {
      name: "Web Search",
      description: "Enable real-time web search capabilities during chats",
      free: "20/month",
      pro: "100/month",
    },
    {
      name: "Document Analysis",
      description: "AI-powered analysis of PDFs, docs, spreadsheets & more",
      free: false,
      pro: true,
    },
    {
      name: "Priority Support",
      description:
        "Get faster response times and priority support from our team",
      free: false,
      pro: true,
    },
  ];

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto max-w-5xl">
        <div className="flex text-center justify-center items-center gap-4 flex-col">
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-center">
              Simple, transparent pricing
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground max-w-xl text-center">
              Full featured interface, pay only for advanced capabilities
            </p>
          </div>

          <div className="grid text-left w-full grid-cols-3 divide-x pt-20 items-center">
            {/* Feature column header */}
            <div className="px-3 lg:px-6 py-4 mt-auto">
              <b>Features</b>
            </div>

            {/* Free tier header */}
            <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
              <p className="text-2xl">Free</p>
              <p className="text-sm text-muted-foreground">
                Full-featured interface for all your AI interactions. Bring your
                own API keys.
              </p>
              <p className="flex flex-col lg:flex-row lg:items-center gap-2 text-xl mt-8">
                <span className="text-4xl">$0</span>
                <span className="text-sm text-muted-foreground">forever</span>
              </p>
              <Button
                variant="outline"
                className="gap-2 mt-8 group w-full h-10"
              >
                Get Started
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Pro tier header */}
            <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
              <div className="flex items-center gap-4">
                <p className="text-2xl">Pro</p>
                <Badge className="text-xs bg-secondary text-primary hover:bg-secondary/80 font-medium">
                  Popular
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced web search and RAG capabilities for enhanced
                understanding
              </p>
              <p className="flex flex-col lg:flex-row lg:items-center gap-2 text-xl mt-8">
                <span className="text-4xl">$8</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </p>
              <Button className="gap-2 mt-8 w-full h-10 group">
                Upgrade
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Feature rows */}
            {features.map((feature) => (
              <React.Fragment key={feature.name}>
                <div className="px-3 lg:px-6 py-4 group relative">
                  <div className="flex flex-col gap-1">
                    {feature.name}
                    {feature.description && (
                      <p className="text-muted-foreground text-xs">
                        {feature.description}
                      </p>
                    )}
                  </div>
                  {/* {feature.description && ( */}
                  {/*   <div className="invisible group-hover:visible absolute left-0 mt-2 p-2 bg-popover text-sm rounded-md shadow-lg w-64 z-10"> */}
                  {/*     {feature.description} */}
                  {/*   </div> */}
                  {/* )} */}
                </div>
                <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
                  {typeof feature.free === "boolean" ? (
                    feature.free ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    )
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {feature.free}
                    </p>
                  )}
                </div>
                <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
                  {typeof feature.pro === "boolean" ? (
                    feature.pro ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    )
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {feature.pro}
                    </p>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
