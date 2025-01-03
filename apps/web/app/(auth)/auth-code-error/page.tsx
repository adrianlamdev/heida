"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";

export default function AuthCodeErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get("type");
  const next = searchParams.get("next");
  const error = searchParams.get("error");

  // Map Supabase errors to user-friendly messages
  const errorMessages: { [key: string]: string } = {
    invalid_token: "The provided token is invalid or has expired.",
    token_expired: "The token has expired. Please request a new one.",
    recovery_failed: "Password recovery failed. Please try again.",
    Default: "An unexpected error occurred. Please try again later.",
  };

  // Determine the error message
  const errorMessage =
    error && errorMessages[error]
      ? errorMessages[error]
      : errorMessages["Default"];

  return (
    <div className="h-screen w-full flex items-center">
      <div className="w-full max-w-md">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Recovery Error
            </h1>
            <p className="text-sm text-muted-foreground">
              There was an issue with your recovery request. Please review the
              error below.
            </p>
          </div>

          {/* Display the error message */}
          <Alert className="backdrop-blur bg-rose-800/20 border-rose-800/30 text-rose-700">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          {/* Provide actions based on the error */}
          <div className="space-y-2">
            {type === "recovery" && (
              <Button
                className="w-full"
                onClick={() => router.push("/forgot-password")}
              >
                Request a New Recovery Link
              </Button>
            )}
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push(next || "/sign-in")}
            >
              Return to Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
