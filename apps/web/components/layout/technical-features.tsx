import { CardContent, CardHeader } from "@workspace/ui/components/card";
import { Code2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeMathjax from "rehype-mathjax";
import remarkMath from "remark-math";
import { Card } from "../feature-card";

export default function TechnicalFeatures() {
  return (
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
  );
}
