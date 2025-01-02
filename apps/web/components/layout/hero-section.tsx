import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Sparkles, ChevronRight } from "lucide-react";
import { BackgroundBeams } from "../background-beams";
import { TextGenerateEffect } from "../text-generate-effect";
import { z } from "zod";

export default function HeroSection() {
  return (
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
  );
}
