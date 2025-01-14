"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

const Nav = ({ className }: { className?: string }) => {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const springConfig = {
    type: "spring",
    stiffness: 260,
    damping: 20,
    mass: 1,
  };

  const fadeInUpVariants = {
    initial: {
      opacity: 0,
      y: -20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  };

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 flex justify-center w-screen backdrop-blur-sm px-4 transition-colors duration-200 ${
        hasScrolled ? "bg-background/80" : ""
      }`}
    >
      <div className="max-w-6xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springConfig}
            className={`w-full ${className}`}
          >
            <div className="max-w-screen-xl mx-auto py-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="font-bold text-2xl hover:text-primary/80 transition-colors flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
                    />
                  </svg>
                  heida
                </Link>
                <Link href="#hero">
                  <Button
                    variant="outline"
                    className="border text-sm font-medium relative text-foreground px-4 py-2 rounded-full"
                  >
                    <span>Join Waitlist</span>
                    <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Nav;
