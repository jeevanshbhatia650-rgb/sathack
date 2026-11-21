'use client';

import React, { useState } from 'react';
import { Navbar } from '../src/components/layout/Navbar';
import { HeroSection } from '../src/components/hero/HeroSection';
import { AppliedSystemsSection } from '../src/components/positioning/AppliedSystemsSection';
import { TechStackStrip } from '../src/components/showcase/TechStackStrip';
import { FannedDemoShowcase } from '../src/components/showcase/FannedDemoShowcase';
import { MeasurableGrowthSection } from '../src/components/impact/MeasurableGrowthSection';
import { GeoPricingSection } from '../src/components/pricing/GeoPricingSection';
import { ContactContractModal } from '../src/components/contact/ContactContractModal';
import { WebWinkLogo } from '../src/components/brand/WebWinkLogo';

export default function Home() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('14-Day Core System Sprint');

  const handleOpenContact = (tierName?: string) => {
    if (tierName) {
      setSelectedTier(tierName);
    }
    setIsContactModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink-primary)] selection:bg-[#E2C870] selection:text-[#111111] transition-colors relative">
      {/* Top Banner: Sathack Dual-Server Agentic Orchestrator */}
      <div className="w-full bg-gradient-to-r from-gray-950 via-gray-900 to-black border-b border-cyan-500/30 px-4 py-2.5 text-center text-xs font-mono relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-gray-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span>Sathack Agentic Orchestrator &amp; Pixelate Dual-Server Stream is Live</span>
          <a
            href="/sathack"
            className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
          >
            Launch Orchestrator &rarr;
          </a>
        </div>
      </div>

      {/* 1. Global Navigation Bar with Floating Pill & Tactile Buttons */}
      <Navbar onOpenContact={() => handleOpenContact()} />

      {/* 2. Section 1: Hero & Persistent 3D Rubik's Cube with Autonomous Solver & Gravity Fall */}
      <HeroSection onOpenContact={() => handleOpenContact()} />

      {/* 3. Section 2: "Applied Systems" (Visual Poetry Layout + 24/7 AI Automation Positioning) */}
      <AppliedSystemsSection />

      {/* 4. Real-Logo Tech Stack Strip (Pure Official Logos Only + Infinite Auto-Scroll) */}
      <TechStackStrip />

      {/* 5. Section 3: Fanned 6-Card Live Demo Showcase (Playful Spring Hover & Auto-Playing Loops) */}
      <FannedDemoShowcase onOpenContact={() => handleOpenContact()} />

      {/* 6. Section 4: Measurable Growth (Comparative ROI Charts & Donut Gauges Only) */}
      <MeasurableGrowthSection />

      {/* 7. Section 5: Automatic Geo-IP Commercial Rate Card (USD vs. 25%-Off INR with "Contact Us" CTAs) */}
      <GeoPricingSection onOpenContact={(tier) => handleOpenContact(tier)} />

      {/* 8. 2-Step Popup Modal: Commercial Agreement & Legal Clauses -> Project Inquiry Dispatch */}
      <ContactContractModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        initialTier={selectedTier}
      />

      {/* Horizontal Divider Line above Lower Footer where 30 falling Rubik cubes pile up */}
      <div
        id="footer-divider"
        className="w-full border-t border-[var(--border-ink)]/15 max-w-7xl mx-auto my-6 relative z-10"
      />

      {/* Footer */}
      <footer className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <WebWinkLogo variant="horizontal" iconClassName="h-7 w-auto" />
            <span className="text-xs font-mono text-[var(--ink-secondary)]">
              // Autonomous Agency Engine &amp; 2026 Commercial Architecture
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[var(--ink-secondary)]">
            <a href="#applied-systems" className="hover:text-[var(--ink-primary)] transition-colors">
              Systems
            </a>
            <a href="#demos" className="hover:text-[var(--ink-primary)] transition-colors">
              Demos
            </a>
            <a href="#impact" className="hover:text-[var(--ink-primary)] transition-colors">
              Impact
            </a>
            <a href="#pricing" className="hover:text-[var(--ink-primary)] transition-colors">
              Rate Card
            </a>
            <button
              onClick={() => handleOpenContact()}
              className="hover:text-[var(--ink-primary)] transition-colors font-bold text-[#c7a73f] dark:text-[#E2C870]"
            >
              Contact Us
            </button>
          </div>

          <div className="text-xs font-mono text-[var(--ink-secondary)]">
            © 2026 WebWink Protocol. All Rights Reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
