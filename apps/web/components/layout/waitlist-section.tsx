import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { RainbowButton } from "../rainbow-button";

export default function WaitlistSection() {
  return (
    <section className="relative py-24 px-4 bg-background">
      <div className="max-w-xl mx-auto text-center space-y-8 flex flex-col items-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-white/70 text-transparent bg-clip-text">
          Join the Waitlist
        </h2>
        <p className="text-lg text-muted-foreground">
          Be among the first to experience the future of AI interaction. Limited
          spots available for our private beta.
        </p>
        <Link href="#hero">
          <RainbowButton>
            Join Beta
            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </RainbowButton>
        </Link>
      </div>
    </section>
  );
}
