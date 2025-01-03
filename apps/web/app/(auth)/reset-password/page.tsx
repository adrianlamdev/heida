"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get("token_hash");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!token) {
      setError("Invalid token hash.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(data.message);
      setCountdown(5);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      router.push("/sign-in");
    }
  }, [countdown, router]);

  return (
    <div className="h-screen w-full flex items-center">
      <div className="w-full max-w-md">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Reset Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter a new password for your account.
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <FormLabel htmlFor="password">New Password</FormLabel>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your new password"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-left mt-1 text-sm text-rose-700" />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
          {error && (
            <Alert className="backdrop-blur bg-rose-800/20 border-rose-800/30 text-rose-700 mt-10">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <div className="space-y-4">
              <Alert className="backdrop-blur bg-green-800/20 border-green-800/30 text-green-700 mt-10">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
              <p className="text-center text-muted-foreground text-sm font-medium">
                You will be redirected in {countdown} seconds...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
