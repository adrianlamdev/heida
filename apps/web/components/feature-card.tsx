"use client";

import type React from "react";
import { cn } from "@workspace/ui/lib/utils";

// TODO: remove
// export function FeatureCard() {
//   return (
//     <Card>
//       <CardContainer>
//         <CardContent />
//       </CardContainer>
//       <CardTitle>Powerful Integrations</CardTitle>
//       <CardDescription>
//         A card that showcases a set of tools that you use to create your
//         product.
//       </CardDescription>
//     </Card>
//   );
// }
// const CardContent = () => {
//   return (
//     <div className="p-8 overflow-hidden h-full relative flex items-center justify-center">
//       <div className="flex flex-row flex-shrink-0 justify-center items-center gap-3">
//         {/* <Container className="w-20 h-20"> */}
//         {/*   <MetaIconOutline className="h-8 w-8 text-foreground" /> */}
//         {/* </Container> */}
//
//         <Container className="">
//           <ClaudeLogo className="h-6 w-6 text-foreground" />
//         </Container>
//         <Container className="w-20 h-20">
//           <GitHubLogo className="h-8 w-8 text-foreground" />
//         </Container>
//         <Container className="">
//           <GeminiLogo className="h-6 w-6 text-foreground" />
//         </Container>
//       </div>
//     </div>
//   );
// };

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        // "w-full p-8 rounded-lg border bg-background shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset] group hover:border-primary/20 transition-colors",
        "w-full p-8 rounded-lg border bg-background group hover:border-primary/20 transition-colors",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h3 className={cn("text-lg font-semibold text-foreground py-2", className)}>
      {children}
    </h3>
  );
};

export const CardDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={cn(
        "text-sm font-normal text-muted-foreground max-w-sm",
        className,
      )}
    >
      {children}
    </p>
  );
};

export const CardContainer = ({
  className,
  children,
  showGradient = true,
}: {
  className?: string;
  children: React.ReactNode;
  showGradient?: boolean;
}) => {
  return (
    <div
      className={cn(
        "h-[15rem] md:h-[20rem] rounded-xl z-40",
        className,
        showGradient &&
          "bg-muted [mask-image:radial-gradient(50%_50%_at_50%_50%,white_0%,transparent_100%)]",
      )}
    >
      {children}
    </div>
  );
};

// const Container = ({
//   className,
//   children,
// }: {
//   className?: string;
//   children: React.ReactNode;
// }) => {
//   return (
//     <div
//       className={cn(
//         `h-16 w-16 border border-primary/20 rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
//     shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]
//     `,
//         className,
//       )}
//     >
//       {children}
//     </div>
//   );
// };
