"use client";
import React from "react";
import HeroSection from "@/components/layout/hero-section";
import FeaturesGrid from "@/components/layout/features-grid";
import TechnicalFeatures from "@/components/layout/technical-features";
import WaitlistSection from "@/components/layout/waitlist-section";
import { FeaturesSection } from "@/components/layout/features-section";

const DemoVideo = () => (
  <div className="flex justify-center items-center md:px-4 px-6 lg:px-8">
    <video
      src="/demo.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      className="w-[90%] md:w-[80%] lg:w-[60%] xl:w-[50%] 
                 h-auto md:rounded-xl rounded-2xl lg:rounded-3xl 
                 shadow-lg object-cover border"
    />
  </div>
);

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background antialiased" id="hero">
      <HeroSection />
      <DemoVideo />
      <FeaturesSection />
      {/* <FeaturesGrid /> */}
      <TechnicalFeatures />
      <WaitlistSection />
    </main>
  );
}
