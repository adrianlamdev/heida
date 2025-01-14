import Footer from "@/components/layout/footer";
import Nav from "@/components/layout/nav";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col">
      <div className="z-50 flex justify-center w-screen bg-background/80 backdrop-blur-sm px-4">
        <div className="max-w-5xl w-full">
          <div className="max-w-screen-xl mx-auto py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="font-bold text-2xl hover:text-primary/90 transition-colors"
              >
                heida
              </Link>
              {/* <Link href="#hero"> */}
              {/*   <Button */}
              {/*     variant="outline" */}
              {/*     className="border text-sm font-medium relative text-foreground px-4 py-2 rounded-full" */}
              {/*   > */}
              {/*     <span>Join Waitlist</span> */}
              {/*     <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" /> */}
              {/*   </Button> */}
              {/* </Link> */}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
