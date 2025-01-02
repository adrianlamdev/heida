"use client";
import React from "react";
import HeroSection from "@/components/layout/hero-section";
import FeaturesGrid from "@/components/layout/features-grid";
import TechnicalFeatures from "@/components/layout/technical-features";
import WaitlistSection from "@/components/layout/waitlist-section";
export default function HomePage() {
  return (
    <main className="min-h-screen bg-background antialiased" id="hero">
      <HeroSection />
      <div className="flex justify-center items-center -mt-16 md:-mt-24 lg:-mt-32 md:px-4 px-6 lg:px-8">
        <video
          src="/demo.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] 
                     h-auto md:rounded-xl rounded-2xl lg:rounded-3xl 
                     shadow-lg object-cover border"
        />
      </div>
      <FeaturesGrid />
      <TechnicalFeatures />
      <WaitlistSection />
    </main>
  );
}
