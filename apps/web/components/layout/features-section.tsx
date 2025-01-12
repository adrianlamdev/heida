import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import {
  Command,
  Bot,
  Wand2,
  MessageSquare,
  GitFork,
  Network,
  Replace,
  Database,
} from "lucide-react";
import {
  Card,
  CardContainer,
  CardTitle,
  CardDescription,
} from "../feature-card";

export function FeaturesSection() {
  const features = [
    {
      title: "Flexible Conversation Structure",
      description:
        "Branch, merge, and organize your chats like git - fork discussions, explore multiple directions, and maintain a complete history of your thought process.",
      skeleton: <SkeletonThree />,
      icon: GitFork,
      className: "col-span-1 lg:col-span-4 border-b lg:border-r",
    },
    {
      title: "Visual Knowledge Maps",
      description:
        "Transform conversations into explorable knowledge graphs, helping you discover connections and insights across all your discussions.",
      skeleton: <SkeletonTwo />,
      icon: Network,
      className: "border-b col-span-1 lg:col-span-2",
    },
    {
      title: "Adaptive Model Selection",
      description:
        "Get the right AI expertise at the right time - switch between specialized models while maintaining full conversation context and history.",
      skeleton: <SkeletonOne />,
      icon: Replace,
      className: "col-span-1 lg:col-span-3 lg:border-r",
    },
    {
      title: "Personalized Knowledge Base",
      description:
        "Your conversations automatically build a searchable knowledge repository that learns from your specific domain expertise and questions.",
      skeleton: <SkeletonFour />,
      icon: Database,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];
  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-6xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-semibold">
          Packed with Power
        </h4>

        <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-muted-foreground text-center">
          Unite the power of multiple AI models in one intelligent interface.
          From quick queries to complex analysis, everything flows through a
          single, elegant workspace.
        </p>
      </div>

      <div className="relative ">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 rounded-md border">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <feature.icon className="h-4 w-4 text-primary" />
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className=" h-full w-full pt-10">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className=" max-w-5xl mx-auto text-left tracking-tight text-xl md:text-2xl md:leading-snug font-medium">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base  max-w-4xl text-left mx-auto",
        "text-center font-normal text-muted-foreground",
        "text-left max-w-sm mx-0 md:text-sm my-2",
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <CardContainer>
      <div className="flex items-center justify-center h-full">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Command className="h-8 w-8 text-primary" />
          </div>
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Wand2 className="h-8 w-8 text-primary" />
          </div>
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>
    </CardContainer>
  );
};

export const SkeletonThree = () => {
  return (
    <Link
      href="https://www.youtube.com/watch?v=RPa3_AD1_Vs"
      target="__blank"
      className="relative flex gap-10  h-full group/image"
    >
      <div className="w-full  mx-auto bg-transparent dark:bg-transparent group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2  relative">
          {/* TODO */}
          <Image
            src=""
            alt="header"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-center rounded-sm blur-none group-hover/image:blur-md transition-all duration-200"
          />
        </div>
      </div>
    </Link>
  );
};

export const SkeletonTwo = () => {
  const images = [];

  const imageVariants = {
    whileHover: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
    whileTap: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
  };
  return (
    <div className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden">
      {/* TODO */}
      <div className="flex flex-row -ml-20">
        {images.map((image, idx) => (
          <motion.div
            variants={imageVariants}
            key={"images-first" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 flex-shrink-0 overflow-hidden"
          >
            <Image
              src={image}
              alt="bali images"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover flex-shrink-0"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row">
        {images.map((image, idx) => (
          <motion.div
            key={"images-second" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 flex-shrink-0 overflow-hidden"
          >
            <Image
              src={image}
              alt="bali images"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover flex-shrink-0"
            />
          </motion.div>
        ))}
      </div>

      <div className="absolute left-0 z-[100] inset-y-0 w-20 bg-gradient-to-r from-white dark:from-black to-transparent  h-full pointer-events-none" />
      <div className="absolute right-0 z-[100] inset-y-0 w-20 bg-gradient-to-l from-white dark:from-black  to-transparent h-full pointer-events-none" />
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-60  flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10"></div>
  );
};
