import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { Toaster } from "@workspace/ui/components/sonner";
import "@workspace/ui/globals.css";
import {
  AlertOctagon,
  AlertTriangle,
  CircleCheck,
  Info,
  Loader2,
} from "lucide-react";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased scroll-smooth`}
      >
        <Providers>
          <main>{children}</main>
          <Toaster
            icons={{
              success: <CircleCheck className="w-4 h-4" />,
              info: <Info className="w-4 h-4" />,
              warning: <AlertTriangle className="w-4 h-4" />,
              error: <AlertOctagon className="w-4 h-4" />,
              loading: <Loader2 className="w-4 h-4 animate-spin" />,
            }}
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "fixed right-0 m-6 flex items-center gap-2 px-4 py-2 rounded-md border text-sm text-nowrap backdrop-blur shadow",
                error:
                  "bg-rose-800/20 border-rose-800/30 text-rose-700 mx-auto",
                success: "bg-green-800/20 border-green-800/30 text-green-700",
                warning:
                  "bg-yellow-800/20 border-yellow-800/30 text-yellow-700",
                info: "bg-blue-800/20 border-blue-800/30 text-blue-700",
                loading: "bg-gray-800/20 border-gray-800/30 text-gray-700",
                title: "font-medium",
                description: "text-muted-foreground",
                actionButton:
                  "px-2 py-1 bg-primary text-primary-foreground rounded hover:opacity-90",
                cancelButton:
                  "px-2 py-1 bg-muted text-muted-foreground rounded hover:opacity-90",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
