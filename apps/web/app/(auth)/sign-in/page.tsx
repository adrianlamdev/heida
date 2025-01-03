"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card } from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
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

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in");
      }
      router.push("/chat");
    } catch (error) {
      console.error("Sign-up error:", error);
      if (error instanceof Error) {
        if (error.message === "Email not confirmed") {
          router.push(`/auth/verify?email=${encodeURIComponent(values.email)}`);
        }
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="h-screen w-full flex items-center ubg-gradient-to-t from-background to-secondary/20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="w-full border-none bg-transparent backdrop-blur-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and password to sign in
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <motion.div
                  variants={formVariants}
                  className="space-y-4"
                  animate={form.formState.isSubmitting ? "submitting" : "idle"}
                >
                  <div className="space-y-1">
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              id="email"
                              placeholder="name@example.com"
                              autoComplete="email"
                              type="email"
                              disabled={form.formState.isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-left mt-1 text-sm text-rose-700" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-1">
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Enter your password"
                              autoComplete="new-password"
                              type="password"
                              id="password"
                              disabled={form.formState.isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-left mt-1 text-sm text-rose-700" />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
                <Button
                  type="submit"
                  className="w-full group"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing you in...
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      Sign in
                    </motion.div>
                  )}
                </Button>
              </form>
            </Form>
            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
              >
                Sign up
              </Link>
            </p>

            <AnimatePresence>
              {error && (
                <motion.div
                  variants={alertVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Alert className="backdrop-blur bg-rose-800/20 border-rose-800/30 text-rose-700 mt-10">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
