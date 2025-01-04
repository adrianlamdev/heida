import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import ReactConfetti from "react-confetti";
import { Input } from "@workspace/ui/components/input";
import { Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { BackgroundBeams } from "../background-beams";
import { TextGenerateEffect } from "../text-generate-effect";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
});

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const alertVariants = {
  initial: { opacity: 0, scale: 0.95, y: -10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.2 },
  },
};

const formVariants = {
  submitting: { scale: 0.99, opacity: 0.8 },
  idle: { scale: 1, opacity: 1 },
};

type FormValues = z.infer<typeof formSchema>;

export default function HeroSection() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError("");

    try {
      if (!navigator.onLine) {
        throw new Error(
          "No internet connection. Please check your connection and try again.",
        );
      }

      const response = await fetch("/api/beta-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong. Please try again later.",
        );
      }

      setSubmitted(true);
      setShowConfetti(true);

      setTimeout(() => {
        setSubmitted(false);
        setShowConfetti(false);
      }, 5000);
    } catch (err) {
      console.error("Submission error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <section className="relative h-screen bg-gradient-to-tr from-background to-secondary/30 flex flex-col items-center justify-center overflow-hidden pb-16 md:pb-24 lg:pb-32">
      {showConfetti && (
        <ReactConfetti
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          initialVelocityY={20}
          tweenDuration={4000}
        />
      )}
      <div className="relative z-10 px-4 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="space-y-4">
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-1.5 text-sm border border-primary/20 backdrop-blur-sm hover:bg-primary/15 transition-colors">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                <span className="bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text font-medium">
                  Now in Private Beta
                </span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <TextGenerateEffect
                words="Your Command Center for AI Interactions"
                className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text"
              />
            </motion.div>
          </div>

          <motion.p
            variants={itemVariants}
            className="text-xl text-white/70 max-w-2xl"
          >
            One elegant interface unifying OpenRouter models, Claude, and GPT-4.
            With real-time file collaboration, contextual memory, and powerful
            markdown support.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="pt-6 w-full max-w-lg relative"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <motion.div
                  variants={formVariants}
                  animate={form.formState.isSubmitting ? "submitting" : "idle"}
                  className="flex gap-4 justify-center items-center"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <motion.div whileTap={{ scale: 0.995 }}>
                            <Input
                              placeholder="you@example.com"
                              className="h-10 bg-background/50 border-primary/20 backdrop-blur-sm transition-colors hover:bg-background/60 focus:bg-background/70"
                              autoComplete="email"
                              type="email"
                              disabled={
                                form.formState.isSubmitting || submitted
                              }
                              {...field}
                            />
                          </motion.div>
                        </FormControl>
                        <FormMessage className="text-left mt-1 text-sm absolute" />
                      </FormItem>
                    )}
                  />
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-10 group px-3 w-28 transition-all"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center"
                        >
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          Joining...
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center"
                        >
                          Join Beta
                          <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </Form>

            <div className="absolute left-0 right-0 top-20">
              <AnimatePresence>
                {error && (
                  <motion.div
                    variants={alertVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Alert className="max-w-lg mx-auto backdrop-blur bg-rose-800/20 border-rose-800/30 text-destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {submitted && (
                  <motion.div
                    variants={alertVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Alert className="max-w-lg mx-auto backdrop-blur bg-secondary/40 shadow-inner font-medium">
                      <AlertDescription>
                        Thanks for joining! We&apos;ll be in touch soon.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <BackgroundBeams className="opacity-30" />
    </section>
  );
}
