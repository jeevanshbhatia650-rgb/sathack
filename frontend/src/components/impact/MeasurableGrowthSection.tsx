'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Zap, Bot, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export const MeasurableGrowthSection: React.FC = () => {
  return (
    <section id="impact" className="w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mx-auto text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--border-ink)]/20 bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#E2C870]" />
          <span>04 / MEASURABLE GROWTH</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--ink-primary)]">
          Automated Web + 24/7 AI vs. Manual Operations
        </h2>
        <p className="mt-4 text-base text-[var(--ink-secondary)] leading-relaxed">
          Real, cited performance benchmarks comparing automated operations to traditional legacy workflows.
        </p>
      </motion.div>

      {/* Part A: 2x2 Comparative Animated Bar Graph Grid (Visual Graphs Only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {/* Metric 1: Buyer Trust & Credibility */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border-[1.5px] border-[var(--border-ink)] bg-[var(--bg-surface)] p-6 sm:p-8 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-[var(--ink-primary)]">
                Online Research Before Buying
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--ink-secondary)] font-medium">
                GE Capital Retail Study
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {/* Primary Bar: 81% */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5 text-[var(--ink-primary)]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8883d6]" />
                    <span>Fast Website + Brand Proof</span>
                  </span>
                  <span className="text-sm font-black text-[#8883d6]">81%</span>
                </div>
                <div className="h-4 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden p-0.5">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    style={{ originX: 0, width: '81%' }}
                    transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-[#B4B0F5] relative"
                  >
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white animate-pulse" />
                  </motion.div>
                </div>
              </div>

              {/* Baseline Bar: 19% */}
              <div>
                <div className="flex justify-between items-center text-xs font-medium mb-1.5 text-[var(--ink-secondary)]">
                  <span>No Website / Offline Only</span>
                  <span className="font-mono">19%</span>
                </div>
                <div className="h-4 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden p-0.5">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    style={{ originX: 0, width: '19%' }}
                    transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-zinc-400/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-ink)]/10 flex items-center justify-between text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <span>+326% Higher Customer Trust Inbound</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Metric 2: Sub-60s Lead Response Velocity */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border-[1.5px] border-[var(--border-ink)] bg-[var(--bg-surface)] p-6 sm:p-8 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-[var(--ink-primary)]">
                Sub-60s AI Response vs. 2h Delay
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--ink-secondary)] font-medium">
                HBR / Velocify Study
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {/* Primary Bar: 391% */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5 text-[var(--ink-primary)]">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#c7a73f]" />
                    <span>24/7 AI Voice / WhatsApp (&lt;60s)</span>
                  </span>
                  <span className="text-sm font-black text-[#c7a73f]">391% (4.9x)</span>
                </div>
                <div className="h-4 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden p-0.5">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    style={{ originX: 0, width: '98%' }}
                    transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-[#E2C870] relative"
                  >
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white animate-pulse" />
                  </motion.div>
                </div>
              </div>

              {/* Baseline Bar: 100% (25% visual scale) */}
              <div>
                <div className="flex justify-between items-center text-xs font-medium mb-1.5 text-[var(--ink-secondary)]">
                  <span>Manual Rep Follow-Up (~2 Hours)</span>
                  <span className="font-mono">100% (Baseline)</span>
                </div>
                <div className="h-4 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden p-0.5">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    style={{ originX: 0, width: '25%' }}
                    transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-zinc-400/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-ink)]/10 flex items-center justify-between text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <span>+391% Lift in Closed Deals</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Metric 3: 3-Year SMB Revenue Expansion */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border-[1.5px] border-[var(--border-ink)] bg-[var(--bg-surface)] p-6 sm:p-8 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-[var(--ink-primary)]">
                Automated vs. Traditional SMBs
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--ink-secondary)] font-medium">
                Deloitte Connected SMB
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {/* Primary Bar: +68% */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5 text-[var(--ink-primary)]">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#8883d6]" />
                    <span>Automated Systems Architecture</span>
                  </span>
                  <span className="text-sm font-black text-[#8883d6]">+68% Revenue</span>
                </div>
                <div className="h-4 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden p-0.5">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    style={{ originX: 0, width: '68%' }}
                    transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-[#B4B0F5] relative"
                  >
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white animate-pulse" />
                  </motion.div>
                </div>
              </div>

              {/* Baseline Bar: +24% */}
              <div>
                <div className="flex justify-between items-center text-xs font-medium mb-1.5 text-[var(--ink-secondary)]">
                  <span>Manual Traditional Operations</span>
                  <span className="font-mono">+24% Revenue</span>
                </div>
                <div className="h-4 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden p-0.5">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    style={{ originX: 0, width: '24%' }}
                    transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-zinc-400/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-ink)]/10 flex items-center justify-between text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <span>2.8x Faster 3-Year Growth Pace</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Metric 4: Mobile Visitor Retention */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border-[1.5px] border-[var(--border-ink)] bg-[var(--bg-surface)] p-6 sm:p-8 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-[var(--ink-primary)]">
                Sub-1.5s Next.js vs. 5s Legacy Stack
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--ink-secondary)] font-medium">
                Google Web Vitals
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {/* Primary Bar: 91% */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5 text-[var(--ink-primary)]">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#c7a73f]" />
                    <span>Modern Next.js / Edge (&lt;1.5s)</span>
                  </span>
                  <span className="text-sm font-black text-[#c7a73f]">91% Retained</span>
                </div>
                <div className="h-4 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden p-0.5">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    style={{ originX: 0, width: '91%' }}
                    transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-[#E2C870] relative"
                  >
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white animate-pulse" />
                  </motion.div>
                </div>
              </div>

              {/* Baseline Bar: 47% */}
              <div>
                <div className="flex justify-between items-center text-xs font-medium mb-1.5 text-[var(--ink-secondary)]">
                  <span>Bloated Legacy Stack (&gt;5.0s)</span>
                  <span className="font-mono">47% Retained</span>
                </div>
                <div className="h-4 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden p-0.5">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    style={{ originX: 0, width: '47%' }}
                    transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-rose-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-ink)]/10 flex items-center justify-between text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <span>Nearly 2x More Traffic Converts</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </motion.div>
      </div>

      {/* Part B: 3 Animated Circular Pictorial Donut Gauges (180px x 180px) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Gauge 1: 78% First-Responder Win Rate in #E2C870 Gold */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border-[1.5px] border-[var(--border-ink)] bg-[var(--bg-surface)] p-8 flex flex-col items-center text-center justify-between shadow-sm"
        >
          <div className="relative w-[180px] h-[180px] flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-[var(--bg-elevated)]"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#E2C870"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="251.2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 0.78 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 12 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                <Zap className="w-6 h-6 text-[#c7a73f] mb-1" />
              </motion.div>
              <span className="text-3xl font-black text-[var(--ink-primary)]">78%</span>
              <span className="text-[10px] font-mono text-[var(--ink-secondary)]">Win Rate</span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-base font-extrabold text-[var(--ink-primary)]">
              78% First-Responder Win Rate
            </h4>
            <p className="mt-2 text-xs text-[var(--ink-secondary)] leading-relaxed">
              78% of customers buy from the first business that answers them. 24/7 AI assistants respond instantly.
            </p>
          </div>
        </motion.div>

        {/* Gauge 2: 67% Inquiries Auto-Resolved in #B4B0F5 Periwinkle */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border-[1.5px] border-[var(--border-ink)] bg-[var(--bg-surface)] p-8 flex flex-col items-center text-center justify-between shadow-sm"
        >
          <div className="relative w-[180px] h-[180px] flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-[var(--bg-elevated)]"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#B4B0F5"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="251.2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 0.67 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 12 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                <Bot className="w-6 h-6 text-[#8883d6] mb-1" />
              </motion.div>
              <span className="text-3xl font-black text-[var(--ink-primary)]">67%</span>
              <span className="text-[10px] font-mono text-[var(--ink-secondary)]">Resolved</span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-base font-extrabold text-[var(--ink-primary)]">
              67% Inquiries Auto-Resolved
            </h4>
            <p className="mt-2 text-xs text-[var(--ink-secondary)] leading-relaxed">
              Two-thirds of repetitive pricing and booking questions resolve without human intervention.
            </p>
          </div>
        </motion.div>

        {/* Gauge 3: 88% Faster Quote-to-Close in Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border-[1.5px] border-[var(--border-ink)] bg-[var(--bg-surface)] p-8 flex flex-col items-center text-center justify-between shadow-sm"
        >
          <div className="relative w-[180px] h-[180px] flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#E2C870" />
                  <stop offset="100%" stopColor="#B4B0F5" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-[var(--bg-elevated)]"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="251.2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 0.88 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 12 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                <TrendingUp className="w-6 h-6 text-[#c7a73f] mb-1" />
              </motion.div>
              <span className="text-3xl font-black text-[var(--ink-primary)]">88%</span>
              <span className="text-[10px] font-mono text-[var(--ink-secondary)]">Faster</span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-base font-extrabold text-[var(--ink-primary)]">
              88% Faster Quote-to-Close
            </h4>
            <p className="mt-2 text-xs text-[var(--ink-secondary)] leading-relaxed">
              Automated quoting and live dashboards replace manual spreadsheets and slow callbacks.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
