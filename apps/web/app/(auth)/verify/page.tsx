"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   async function sendOtp(email: string) {
  //     try {
  //       const response = await fetch(`/api/auth/resend-otp`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ email }),
  //       });
  //
  //       if (!response.ok) {
  //         throw new Error("Failed to resend OTP");
  //       }
  //     } catch (error) {
  //       setError(
  //         error instanceof Error ? error.message : "Failed to resend OTP",
  //       );
  //     }
  //   }
  //
  //   if (email) {
  //     sendOtp(email);
  //   } else {
  //     router.push("/sign-in");
  //   }
  // });

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    setIsVerifyingOtp(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      router.push(data.redirectTo || "/chat");
    } catch (error) {
      console.error("Verification error:", error);
      setError(error instanceof Error ? error.message : "Failed to verify OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setIsResendingOtp(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      setCooldown(60); // 60-second cooldown
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError(error instanceof Error ? error.message : "Failed to resend OTP");
    } finally {
      setIsResendingOtp(false);
    }
  };

  if (!email) {
    return <div>Invalid email</div>;
  }

  return (
    <div className="h-screen w-full flex items-center ubg-gradient-to-t from-background to-secondary/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="w-full border-none bg-transparent backdrop-blur-sm">
          <div className="space-y-8 flex items-center flex-col">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Verify your email
              </h1>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a verification code to{" "}
                <span className="font-medium">{email}</span>. Please enter the
                code below.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <InputOTP
                maxLength={6}
                value={otp}
                disabled={isVerifyingOtp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }, (_, i) => (
                    <InputOTPSlot key={i} index={i} className="w-12 h-12" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {isVerifyingOtp && (
                <Loader2 className="animate-spin w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <Button
                onClick={handleResendOtp}
                disabled={isResendingOtp || cooldown > 0}
                variant="ghost"
                className="text-sm text-muted-foreground hover:text-primary hover:bg-transparent"
              >
                {isResendingOtp ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : cooldown > 0 ? (
                  `Resend OTP in ${cooldown}s`
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>
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
