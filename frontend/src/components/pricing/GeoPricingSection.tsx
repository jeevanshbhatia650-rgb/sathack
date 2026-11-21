'use client';

import React from 'react';
import { motion } from 'motion/react';
import { PRICING_TIERS, SELF_SERVE_TIER } from '../../config/pricing';
import { useGeoPricing } from '../../hooks/useGeoPricing';
import { Check, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface GeoPricingSectionProps {
  onOpenContact?: (tierName?: string) => void;
}

export const GeoPricingSection: React.FC<GeoPricingSectionProps> = ({ onOpenContact }) => {
  const { region, isIndia, toggleRegion } = useGeoPricing();

  const handleTierSelect = (tierName: string) => {
    if (onOpenContact) {
      onOpenContact(tierName);
    }
  };

  return (
    <section id="pricing" className="w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mx-auto text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--border-ink)]/20 bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#E2C870]" />
          <span>05 / COMMERCIAL RATE CARD</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--ink-primary)]">
          Predictable Sprint Architecture
        </h2>
        <p className="mt-4 text-base text-[var(--ink-secondary)] leading-relaxed">
          Zero surprise billable hours. Transparent milestone deliverables with continuous Run &amp; Improve maintenance.
        </p>

        {/* Currency & Geo-IP Status Pill with Toggle */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 p-1.5 rounded-full border border-[var(--border-ink)]/20 bg-[var(--bg-surface)] shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1 text-xs font-bold text-[var(--ink-primary)]">
            <span
              className={`w-2 h-2 rounded-full ${
                isIndia ? 'bg-emerald-500' : 'bg-[#B4B0F5]'
              }`}
            />
            <span>
              {isIndia
                ? 'Localized for India (INR ₹ · 25% Regional Partner Grant Applied)'
                : 'Global Commercial Rate Card (USD $)'}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRegion}
            className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-[var(--bg-elevated)] hover:bg-[#B4B0F5] hover:text-[#111111] transition-colors border border-[var(--border-ink)]/20"
            title="Switch Currency View"
          >
            Switch to {isIndia ? 'USD ($)' : 'INR (₹)'}
          </motion.button>
        </div>
      </motion.div>

      {/* 3 Main Sprint Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {PRICING_TIERS.map((tier, idx) => {
          const setupPrice = isIndia ? tier.india.setupPrice : tier.global.setupPrice;
          const originalAnchor = isIndia ? tier.india.originalAnchorSetup : null;
          const retainerPrice = isIndia ? tier.india.retainerPrice : tier.global.retainerPrice;
          const originalAnchorRetainer = isIndia ? tier.india.originalAnchorRetainer : null;

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-3xl border-2 p-8 flex flex-col justify-between transition-shadow duration-300 hover:shadow-2xl ${
                tier.featured
                  ? 'border-[#111111] bg-[#FAF9F5] dark:bg-[#18181F] ring-4 ring-[#E2C870]/30 shadow-xl'
                  : 'border-[var(--border-ink)]/30 bg-[var(--bg-surface)]'
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#E2C870] text-[#111111] font-mono font-black text-[11px] uppercase tracking-wider border border-[#111111] shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 fill-current" />
                  <span>Most Selected Architecture</span>
                </div>
              )}

              <div>
                {/* Badge & Title */}
                <div className="text-[11px] font-mono font-bold text-[var(--ink-secondary)]">
                  {tier.badge}
                </div>
                <h3 className="mt-2 text-2xl font-black text-[var(--ink-primary)]">
                  {tier.name}
                </h3>
                <p className="mt-2 text-xs text-[var(--ink-secondary)] leading-relaxed min-h-[36px]">
                  {tier.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-6 pt-6 border-t border-[var(--border-ink)]/15">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[var(--ink-primary)] tracking-tight">
                      {setupPrice}
                    </span>
                    <span className="text-xs font-mono font-semibold text-[var(--ink-secondary)]">
                      setup sprint
                    </span>
                    {originalAnchor && (
                      <span className="text-xs font-mono text-rose-500 line-through">
                        {originalAnchor}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-xs font-mono text-[var(--ink-secondary)]">
                    <span>Retainer: </span>
                    <strong className="text-[var(--ink-primary)] font-bold">
                      {retainerPrice}
                    </strong>
                    {originalAnchorRetainer && (
                      <span className="ml-1 text-rose-500 line-through">
                        {originalAnchorRetainer}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta details */}
                <div className="mt-4 space-y-1.5 text-xs font-mono text-[var(--ink-secondary)]">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#E2C870]" />
                    <span>Timeline: {tier.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B4B0F5]" />
                    <span>Channels: {tier.channelsIncluded}</span>
                  </div>
                </div>

                {/* Feature checklist */}
                <ul className="mt-6 space-y-2.5 pt-6 border-t border-[var(--border-ink)]/15 text-xs">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-[var(--ink-primary)]">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button: Renamed to "Contact Us" */}
              <div className="mt-8 pt-4">
                <motion.button
                  whileHover={{ y: -1.5, scale: 1.02 }}
                  whileTap={{ y: 2.5, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                  type="button"
                  onClick={() => handleTierSelect(tier.name)}
                  className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold border-[1.5px] border-[#111111] transition-all ${
                    tier.featured
                      ? 'bg-[#18181B] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] shadow-[0_3.5px_0_#52525B]'
                      : 'bg-[#E8E4D9] text-[#111111] dark:bg-[#1E1E26] dark:text-[#FAF9F5] shadow-[0_3.5px_0_#111111] hover:bg-[#B4B0F5] hover:text-[#111111]'
                  }`}
                >
                  <span>Contact Us</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Self-Serve Entry Tier Card */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-12 rounded-3xl border-[1.5px] border-[var(--border-ink)] bg-[var(--bg-surface)] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm"
      >
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#B4B0F5] text-[#111111]">
            SELF-SERVE AI WORKFLOW
          </div>
          <h3 className="text-xl font-black text-[var(--ink-primary)]">
            {SELF_SERVE_TIER.name}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--ink-secondary)]">
            {SELF_SERVE_TIER.description}
          </p>
          <span className="block text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            {SELF_SERVE_TIER.trialNote}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-baseline sm:items-center gap-4">
          <div className="text-right sm:text-left">
            <div className="text-2xl sm:text-3xl font-black text-[var(--ink-primary)]">
              {isIndia ? SELF_SERVE_TIER.indiaPrice : SELF_SERVE_TIER.globalPrice}
            </div>
            {isIndia && (
              <span className="text-xs font-mono text-rose-500 line-through">
                {SELF_SERVE_TIER.indiaAnchor}
              </span>
            )}
          </div>
          <motion.button
            whileHover={{ y: -1.5, scale: 1.03 }}
            whileTap={{ y: 2.5, scale: 0.97 }}
            onClick={() => handleTierSelect('Self-Serve Starter Kit')}
            className="px-6 py-3 rounded-full text-xs font-bold border-[1.5px] border-[#111111] bg-[#18181B] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] shadow-[0_3.5px_0_#52525B] whitespace-nowrap"
          >
            <span>Contact Us</span>
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};
