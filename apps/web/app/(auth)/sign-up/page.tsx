"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Link, Loader2 } from "lucide-react";

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
import { useState } from "react";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignUpPage() {
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
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }
      router.push(`/auth/verify?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      console.error("Sign-up error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="h-screen w-full flex items-center ubg-gradient-to-t from-background to-secondary/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="w-full border-none bg-transparent backdrop-blur-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and password to get started
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <motion.div whileTap={{ scale: 0.995 }}>
                            <Input
                              id="email"
                              placeholder="name@example.com"
                              className="w-full bg-background/50 border-primary/20 backdrop-blur-sm transition-colors hover:bg-background/60 focus:bg-background/70"
                              autoComplete="email"
                              type="email"
                              disabled={form.formState.isSubmitting}
                              {...field}
                            />
                          </motion.div>
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
                          <motion.div whileTap={{ scale: 0.995 }}>
                            <Input
                              placeholder="Enter your password"
                              className="w-full bg-background/50 border-primary/20 backdrop-blur-sm transition-colors hover:bg-background/60 focus:bg-background/70"
                              autoComplete="new-password"
                              type="password"
                              id="password"
                              disabled={form.formState.isSubmitting}
                              {...field}
                            />
                          </motion.div>
                        </FormControl>
                        <FormMessage className="text-left mt-1 text-sm text-rose-700" />
                      </FormItem>
                    )}
                  />
                </div>
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
                      Creating account...
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      Create account
                    </motion.div>
                  )}
                </Button>
              </form>
            </Form>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
              >
                Sign in
              </Link>
            </p>
            {error && (
              <Alert className="backdrop-blur bg-rose-800/20 border-rose-800/30 text-rose-700 mt-10">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
