"use client";

import { Separator } from "@workspace/ui/components/separator";
import { createClient } from "@/utils/supabase/client";
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
import { type Provider } from "@supabase/supabase-js";

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
  const [oAuthLoading, setOAuthLoading] = useState<
    "google" | "github" | null
  >();

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

  const handleOAuth = async (provider: Provider) => {
    try {
      setOAuthLoading(provider as "google" | "github");
      setError(null);

      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/chat`,
          scopes: provider === "github" ? "repo read:user" : undefined,
        },
      });

      if (error) {
        setError("Failed to connect to GitHub. Please try again.");
        setOAuthLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("GitHub OAuth error:", err);
    }
  };

  const providers = [
    {
      id: "google",
      name: "Google",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 0 24 24"
          width="24"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
      ),
    },
    {
      id: "github",
      name: "GitHub",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1024"
          height="1024"
          viewBox="0 0 1024 1024"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
            transform="scale(64)"
            fill="#fff"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-screen w-full flex items-center ubg-gradient-to-t from-background to-secondary/20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="w-full border-none bg-transparent backdrop-blur-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Let&apos;s get you signed back in
              </p>
            </div>
            <div className="space-y-2">
              {providers.map((provider) => (
                <Button
                  key={provider.id}
                  className="w-full h-10 gap-4 flex items-center"
                  variant="outline"
                  onClick={() => handleOAuth(provider.id as Provider)}
                  disabled={oAuthLoading === provider.id}
                >
                  {oAuthLoading === provider.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Continue with {provider.name}
                      {provider.icon}
                    </>
                  )}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Separator orientation="horizontal" className="shrink" />
              <span className="text-sm text-muted-foreground font-medium">
                or
              </span>
              <Separator orientation="horizontal" className="shrink" />
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
