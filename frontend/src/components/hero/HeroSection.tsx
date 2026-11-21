'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

const RubiksCubeCanvas = dynamic(
  () => import('./RubiksCubeCanvas').then((mod) => mod.RubiksCubeCanvas),
  { ssr: false }
);

interface HeroSectionProps {
  onOpenContact?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenContact }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isInteractive = scrollY < 60;

  return (
    <div className="relative w-full overflow-hidden">
      {/* 1. Giant Background Poster Typography "WEBWINK®" & Optical Frosted Lenses */}
      <div className="absolute top-28 inset-x-0 w-full max-w-6xl mx-auto flex items-center justify-center min-h-[460px] md:min-h-[520px] pointer-events-none select-none">
        <div className="relative flex items-center justify-center w-full">
          {/* Background Text "WEBWINK®" at z-[5] */}
          <div className="relative flex items-center justify-center z-[5]">
            <motion.h1
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-black text-[clamp(4.8rem,16.5vw,13.5rem)] text-[var(--ink-primary)] tracking-[-0.055em] leading-none transform scale-y-[1.28] transition-colors"
            >
              WEBWINK
            </motion.h1>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-black text-[clamp(1.4rem,4.5vw,3.6rem)] text-[var(--ink-primary)] align-top ml-1 mb-8"
            >
              ®
            </motion.span>
          </div>

          {/* 2. Soft Contact Blur Patches where the Rubik's Cube touches the letters (z-[12], in front of letters, behind 3D Canvas) */}
          {/* Bottom-Left Contact Blur (touching 'E' and 'B') */}
          <div
            className="absolute pointer-events-none rounded-full z-[12]"
            style={{
              left: 'calc(50% - 150px)',
              top: 'calc(50% + 20px)',
              width: '180px',
              height: '180px',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 75%)',
              WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 75%)',
            }}
          />

          {/* Right Contact Blur (touching 'W' and 'I') */}
          <div
            className="absolute pointer-events-none rounded-full z-[12]"
            style={{
              left: 'calc(50% + 50px)',
              top: 'calc(50% - 30px)',
              width: '160px',
              height: '160px',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 75%)',
              WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 75%)',
            }}
          />

          {/* Top Contact Blur (summit blocks touching upper letters) */}
          <div
            className="absolute pointer-events-none rounded-full z-[12]"
            style={{
              left: 'calc(50% - 40px)',
              top: 'calc(50% - 120px)',
              width: '160px',
              height: '150px',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 75%)',
              WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 75%)',
            }}
          />

          {/* 3. Floating Blurry Frosted Glass Circles (z-[15], in front of letters, blurring them underneath) */}
          {/* Blurry Circle 1 (Top Left over 'W') */}
          <motion.div
            animate={{ y: [-8, 8, -8], x: [-4, 4, -4] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-6 left-2 sm:left-8 w-20 h-20 sm:w-26 sm:h-26 rounded-full pointer-events-none z-[15]"
            style={{
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              background:
                'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.1) 60%, rgba(0, 0, 0, 0.2) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow:
                '0 16px 40px rgba(0, 0, 0, 0.22), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.25)',
            }}
          />

          {/* Blurry Circle 2 (Right over 'K') */}
          <motion.div
            animate={{ y: [8, -8, 8], x: [4, -4, 4] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-4 right-6 sm:right-14 w-20 h-20 sm:w-26 sm:h-26 rounded-full pointer-events-none z-[15]"
            style={{
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              background:
                'radial-gradient(circle at 65% 65%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.1) 60%, rgba(0, 0, 0, 0.2) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow:
                '0 16px 40px rgba(0, 0, 0, 0.22), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.25)',
            }}
          />

          {/* Blurry Circle 3 (Bottom Left under 'E' / Gold Satellite) */}
          <motion.div
            animate={{ y: [-5, 5, -5], x: [3, -3, 3] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-2 left-1/4 -ml-16 w-14 h-14 sm:w-16 sm:h-16 rounded-full pointer-events-none z-[15]"
            style={{
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              background:
                'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.08) 60%, rgba(0, 0, 0, 0.15) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow:
                '0 10px 28px rgba(0, 0, 0, 0.18), inset 0 1px 3px rgba(255, 255, 255, 0.5)',
            }}
          />
        </div>
      </div>

      {/* 4. Persistent Full-Document Fixed Canvas Overlay (z-[20], directly in front of letters & blur orbs) */}
      <div
        style={{ zIndex: 20 }}
        className={`fixed inset-0 w-screen h-screen ${
          isInteractive
            ? 'pointer-events-auto cursor-grab active:cursor-grabbing'
            : 'pointer-events-none'
        }`}
      >
        <RubiksCubeCanvas scrollY={scrollY} />
      </div>

      {/* 5. Hero Foreground Controls & Content (z-[30], in front of Canvas with click-through spacer) */}
      <section className="relative z-[30] w-full min-h-[92vh] flex flex-col items-center justify-start pt-28 pb-16 overflow-hidden pointer-events-none">
        {/* Top Protocol Pill Announcement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border-ink)]/20 bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] shadow-sm pointer-events-auto"
        >
          <span className="w-2 h-2 rounded-full bg-[#E2C870] animate-pulse" />
          <span>WebWink Protocol // 2026 Commercial Architecture</span>
        </motion.div>

        {/* Open Breathing Space where the 3D Rubik's Cube hovers (clicks pass directly to Canvas) */}
        <div className="w-full max-w-6xl mx-auto min-h-[420px] md:min-h-[480px] pointer-events-none select-none" />

        {/* Primary Positioning Copy & CTA Controls (pointer-events-auto at z-35) */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-35 w-full max-w-2xl mx-auto text-center px-4 mt-4 pointer-events-auto"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--ink-primary)] tracking-tight">
            Your Business, Automated &amp; Working 24/7.
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[var(--ink-secondary)] font-medium leading-relaxed max-w-xl mx-auto">
            Fast websites, live profit dashboards, and AI sales assistants that capture leads and save hours every week.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-[#111111] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] transition-all shadow-md group"
            >
              <span>Explore Rate Card</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenContact}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold border border-[var(--border-ink)]/25 bg-[var(--bg-surface)] text-[var(--ink-primary)] hover:bg-[var(--accent-purple)]/20 transition-all"
            >
              <span>Contact Us</span>
              <ArrowUpRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
