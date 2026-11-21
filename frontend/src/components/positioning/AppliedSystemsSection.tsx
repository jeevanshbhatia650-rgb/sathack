'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Globe, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';

const TECH_BADGES = [
  { code: 'cl', title: 'Claude 3.7 Sonnet & Reasoning Engines', bg: 'bg-[var(--bg-surface)] text-[var(--ink-primary)]' },
  { code: 'vc', title: 'Ultra-Low Latency Telephony & Voice', bg: 'bg-[#B4B0F5] text-[#111111]' },
  { code: 'wa', title: 'WhatsApp Cloud API Automation', bg: 'bg-[#E2C870] text-[#111111]' },
  { code: 'oc', title: 'OpenClaw Multi-Agent Orchestration', bg: 'bg-[#18181B] text-[#FAF9F5]' },
];

const STAGE_STEPS = [
  {
    num: '01',
    title: 'FIND THE LEVERAGE',
    desc: '30-min audit of your support, sales & ops bottlenecks to pinpoint high-ROI automation targets.',
  },
  {
    num: '02',
    title: 'BUILD THE HARNESS',
    desc: 'Connect Claude/GPT/Gemini to your CRM, WhatsApp & phone lines with human-in-the-loop guardrails.',
  },
  {
    num: '03',
    title: 'WEEK-1 WORKING PILOT',
    desc: 'Test the complete agent pipeline on real customer enquiries within 7 calendar days.',
  },
  {
    num: '04',
    title: 'RUN & IMPROVE',
    desc: 'Continuous evals, latency optimization & frontier model swaps as newer releases drop.',
  },
];

export const AppliedSystemsSection: React.FC = () => {
  return (
    <section id="applied-systems" className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
        {/* Left Column: Asymmetric Stacked Typography + Positioning Copy (52% on desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
          <div>
            {/* Giant Stacked Lowercase Headline with Slide-up Reveal */}
            <motion.h2
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-black text-[clamp(3.8rem,7.5vw,6.8rem)] leading-[0.88] tracking-[-0.045em] text-[var(--ink-primary)]"
            >
              applied<br />systems
            </motion.h2>

            {/* Primary Positioning Copy */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 space-y-3 max-w-xl"
            >
              <h3 className="text-xl sm:text-2xl font-black text-[var(--ink-primary)] tracking-tight">
                Your Business, Automated &amp; Working 24/7.
              </h3>
              <p className="text-base sm:text-lg text-[var(--ink-primary)] font-semibold leading-relaxed">
                Fast websites, live profit dashboards, and AI sales assistants that capture leads and save hours every week.
              </p>
              <p className="text-sm sm:text-base text-[var(--ink-secondary)] font-normal leading-relaxed pt-2">
                We build autonomous voice agents, WhatsApp and web workflows, and high-ticket web applications around the way your team actually works. Built on Claude, GPT, Gemini, and OpenClaw architecture—with a working pilot on your real enquiries in week one, and a human in the loop for anything sensitive.
              </p>
            </motion.div>

            {/* 4 Circular Capability Pills with Staggered Pop-In */}
            <div className="mt-8 flex items-center gap-3">
              {TECH_BADGES.map((badge, idx) => (
                <motion.div
                  key={badge.code}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.15, rotate: 6 }}
                  viewport={{ once: true }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 18,
                    delay: 0.15 + idx * 0.08,
                  }}
                  className={`w-11 h-11 rounded-full border-[1.5px] border-[var(--border-ink)] flex items-center justify-center font-bold text-xs uppercase shadow-sm cursor-default ${badge.bg}`}
                  title={badge.title}
                >
                  {badge.code}
                </motion.div>
              ))}
              <span className="ml-3 text-xs font-mono font-medium text-[var(--ink-secondary)]">
                Core Foundation Topologies
              </span>
            </div>
          </div>

          {/* 2 Bottom Metric Blocks with Animated Entrances */}
          <div className="pt-8 border-t border-[var(--border-ink)]/15 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-2"
            >
              <div className="text-4xl sm:text-5xl font-black tracking-tighter text-[var(--ink-primary)]">
                +2,638
              </div>
              <p className="text-xs sm:text-sm text-[var(--ink-secondary)] font-medium leading-snug">
                Frontier AI releases tracked across 97+ weeks so your stack never falls behind.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="space-y-2"
            >
              <div className="text-4xl sm:text-5xl font-black tracking-tighter text-[var(--ink-primary)]">
                7 days
              </div>
              <p className="text-xs sm:text-sm text-[var(--ink-secondary)] font-medium leading-snug">
                From discovery call to a working pilot running on your real customer data.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Ochre Gold (#E2C870) Cutout Card with Inverted Notches */}
        <div className="lg:col-span-5 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full min-h-[540px] rounded-[36px] bg-[#E2C870] border-[1.5px] border-[#111111] p-8 sm:p-10 text-[#111111] overflow-hidden shadow-xl flex flex-col justify-between"
          >
            {/* Top-Right Inverted Corner Cutout housing Globe Icon */}
            <div
              className="absolute top-0 right-0 w-[78px] h-[78px] bg-[var(--bg-canvas)] rounded-bl-[32px] flex items-center justify-center pointer-events-auto border-l-[1.5px] border-b-[1.5px] border-[#111111]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
            >
              <div className="w-14 h-14 rounded-full bg-[#111111] flex items-center justify-center shadow-inner">
                <Globe className="w-6 h-6 text-white animate-[spin_12s_linear_infinite]" />
              </div>
            </div>

            {/* Bottom-Left Inverted Corner Cutout housing Badges & CTA */}
            <div className="absolute bottom-0 left-0 w-[82px] h-[196px] bg-[var(--bg-canvas)] rounded-tr-[32px] flex flex-col items-center justify-center gap-2.5 p-2 border-r-[1.5px] border-t-[1.5px] border-[#111111]">
              {/* Badge 1: 24/7 Voice */}
              <motion.div
                whileHover={{ scale: 1.12 }}
                className="w-13 h-13 rounded-full bg-[#B4B0F5] border-[1.5px] border-[#111111] flex flex-col items-center justify-center text-[10px] font-black leading-tight shadow-sm cursor-default"
                title="24/7 Autonomous Voice Telephony"
              >
                <span>24/7</span>
                <span className="text-[8px] font-mono font-medium">VOICE</span>
              </motion.div>

              {/* Badge 2: HITL Safety */}
              <motion.div
                whileHover={{ scale: 1.12 }}
                className="w-13 h-13 rounded-full bg-[#FAF9F5] border-[1.5px] border-[#111111] flex flex-col items-center justify-center text-[10px] font-black leading-tight shadow-sm text-[#111111] cursor-default"
                title="Human In The Loop Guardrails"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#111111]" />
                <span className="text-[8px] font-mono font-bold">HITL</span>
              </motion.div>

              {/* Action Button: Scroll to Demos */}
              <motion.a
                whileHover={{ scale: 1.15, rotate: 12 }}
                whileTap={{ scale: 0.95 }}
                href="#demos"
                className="w-13 h-13 rounded-full bg-[#111111] text-white flex items-center justify-center transition-transform shadow-md"
                title="Explore Live Sandboxes"
              >
                <ArrowUpRight className="w-5 h-5 text-white" />
              </motion.a>
            </div>

            {/* Inside the Gold Card Body */}
            <div>
              <div className="text-xs font-mono font-bold tracking-wider text-[#111111]/70 uppercase">
                WebWink Protocol // 2026 Production Blueprint
              </div>
              <h3 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight leading-tight text-[#111111]">
                The 4-Stage Leverage Method
              </h3>
            </div>

            {/* 4-Stage Method List with Sequential Staggered Slide-In */}
            <div className="my-6 space-y-3.5 pl-0 sm:pl-16">
              {STAGE_STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#FAF9F5]/90 rounded-2xl p-3.5 border border-[#111111]/30 shadow-sm transition-transform"
                >
                  <div className="flex items-center gap-2 font-mono text-xs font-extrabold text-[#111111]">
                    <span className="px-1.5 py-0.5 rounded bg-[#111111] text-[#FAF9F5] text-[10px]">
                      {step.num}
                    </span>
                    <span>{step.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#222226] font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#111111]/80 pl-0 sm:pl-16">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#111111]" />
                Zero Vendor Lock-In
              </span>
              <span className="font-mono text-[11px]">Sprint-Based Delivery</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
