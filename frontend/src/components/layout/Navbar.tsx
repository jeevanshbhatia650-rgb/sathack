'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WebWinkLogo } from '../brand/WebWinkLogo';
import { useInkThemeTransition } from '../../hooks/useInkThemeTransition';
import {
  Moon,
  Sun,
  Layers,
  Cpu,
  BarChart3,
  CreditCard,
  Sparkles,
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react';

interface NavbarProps {
  onOpenContact?: () => void;
}

const NAV_LINKS = [
  { label: 'Orchestrator', href: '/sathack', icon: Cpu },
  { label: 'Services', href: '#applied-systems', icon: Layers },
  { label: 'Impact', href: '#impact', icon: BarChart3 },
  { label: 'Rate Card', href: '#pricing', icon: CreditCard },
  { label: 'Live Demos', href: '#demos', icon: Sparkles },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenContact }) => {
  const { isDark, triggerThemeToggle } = useInkThemeTransition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-20 px-4 sm:px-9 flex items-center justify-between backdrop-blur-xl border-b border-[var(--border-ink)]/10 transition-colors"
      style={{
        background: isDark
          ? 'linear-gradient(115deg, rgba(18,18,24,0.88) 0%, rgba(28,28,38,0.75) 50%, rgba(18,18,24,0.92) 100%)'
          : 'linear-gradient(115deg, rgba(250,249,245,0.88) 0%, rgba(235,233,225,0.72) 50%, rgba(250,249,245,0.92) 100%)',
        borderBottomRightRadius: '32px',
      }}
    >
      {/* Brand Logo on Left */}
      <a href="#" className="flex items-center gap-2 group shrink-0">
        <WebWinkLogo variant="horizontal" className="transition-transform group-hover:scale-105" />
      </a>

      {/* Center Floating White/Surface Stadium Pill */}
      <nav
        className="hidden md:flex items-center gap-1 sm:gap-2 px-5 py-2 rounded-full bg-[var(--bg-surface)] text-xs font-semibold"
        style={{
          boxShadow: isDark
            ? '0 10px 30px -5px rgba(0,0,0,0.5)'
            : '0 10px 30px -5px rgba(0,0,0,0.07)',
        }}
      >
        {NAV_LINKS.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-elevated)] transition-colors whitespace-nowrap"
          >
            <motion.span
              whileHover={{ scale: 1.15, rotate: 6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="inline-flex items-center justify-center"
            >
              <Icon className="w-[15px] h-[15px] text-[#c7a73f] dark:text-[#E2C870] group-hover:text-[#8883d6] transition-colors" />
            </motion.span>
            <span>{label}</span>
          </a>
        ))}
      </nav>

      {/* Right-Side Tactile Offset-Shadow Pill Buttons */}
      <div className="flex items-center gap-3">
        {/* Secondary Pill: Tactile Theme Toggle */}
        <motion.button
          whileHover={{ y: -1.5 }}
          whileTap={{ y: 2.5 }}
          transition={{ type: 'spring', stiffness: 450, damping: 20 }}
          onClick={triggerThemeToggle}
          aria-label="Toggle theme"
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold border-[1.5px] border-[#111111] transition-colors"
          style={{
            background: isDark ? '#1E1E26' : '#E8E4D9',
            color: 'var(--ink-primary)',
            boxShadow: '0 3.5px 0 #111111',
          }}
          title="Toggle theme (Ink Bleed 60FPS)"
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-[#E2C870]" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-[#18181B]" />
          )}
          <span className="hidden sm:inline font-mono text-[11px]">
            {isDark ? 'LIGHT' : 'DARK'}
          </span>
        </motion.button>

        {/* Primary Pill: Tactile "Contact Us" Button */}
        <motion.button
          whileHover={{ y: -1.5 }}
          whileTap={{ y: 2.5 }}
          transition={{ type: 'spring', stiffness: 450, damping: 20 }}
          onClick={() => {
            if (onOpenContact) {
              onOpenContact();
            } else {
              window.location.hash = '#pricing';
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-bold border-[1.5px] border-[#111111] transition-colors"
          style={{
            background: isDark ? '#FAF9F5' : '#18181B',
            color: isDark ? '#111111' : '#FAF9F5',
            boxShadow: '0 3.5px 0 #52525B',
          }}
        >
          <span>Contact Us</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </motion.button>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl border border-[var(--border-ink)]/20 text-[var(--ink-primary)]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 px-4 pt-3 pb-6 bg-[var(--bg-canvas)] border-b border-[var(--border-ink)]/15 space-y-2 text-sm font-semibold shadow-2xl">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--bg-elevated)]"
            >
              <Icon className="w-4 h-4 text-[#c7a73f]" />
              <span>{label}</span>
            </a>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenContact) onOpenContact();
            }}
            className="w-full mt-2 inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl bg-[#111111] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] font-bold text-xs"
          >
            <span>Contact Us</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
