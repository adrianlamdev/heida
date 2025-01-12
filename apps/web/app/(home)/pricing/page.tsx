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
      <FeaturesGrid />
      <TechnicalFeatures />
      <WaitlistSection />
    </main>
  );
}
