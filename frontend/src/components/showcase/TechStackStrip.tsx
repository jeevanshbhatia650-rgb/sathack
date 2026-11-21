'use client';

import React from 'react';
import { motion } from 'motion/react';

interface TechLogo {
  name: string;
  icon: React.ReactNode;
}

export const TECH_LOGOS: TechLogo[] = [
  {
    name: 'Claude (Anthropic)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[38px] w-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.28 3.5l5.22 17h-3.6l-1.12-3.8H9.22L8.1 20.5H4.5l5.22-17h4.56zm-1.8 4.2h-.96L9.9 14.1h4.2l-1.62-6.4z" fill="#CC785C"/>
      </svg>
    ),
  },
  {
    name: 'OpenAI (GPT-4o)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[38px] w-auto text-[#10A37F]" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.28 9.37a5.98 5.98 0 0 0-.52-4.95 6.08 6.08 0 0 0-6.52-2.88A6 6 0 0 0 10.7.3a6.08 6.08 0 0 0-5.78 4.19 6 6 0 0 0-3.9 2.82 6.08 6.08 0 0 0 .74 7.12 6 6 0 0 0 .52 4.95 6.08 6.08 0 0 0 6.52 2.88A6 6 0 0 0 13.3 23.7a6.08 6.08 0 0 0 5.78-4.19 6 6 0 0 0 3.9-2.82 6.08 6.08 0 0 0-.7-7.32zm-8.98 12.63c-.45 0-.89-.06-1.31-.18v-4.17l3.65-2.11a.76.76 0 0 0 .38-.66v-4.3l3.63 2.1a4.54 4.54 0 0 1 .1 1.76 4.58 4.58 0 0 1-6.45 7.56zM3.45 18.06a4.57 4.57 0 0 1-.3-1.74c0-.6.1-1.2.33-1.76l3.61 2.08v4.22a.76.76 0 0 0 .76.02l3.65-2.11v-4.22L7.87 12.44a.77.77 0 0 0-.76 0l-3.66 2.11v3.51zm-.88-8.2a4.56 4.56 0 0 1 2.37-3.96 4.6 4.6 0 0 1 4.18.23l-3.62 2.09a.76.76 0 0 0-.38.66v4.3L1.5 11.08a4.5 4.5 0 0 1 1.07-1.22zm14.15-1.4l-3.65-2.1v-4.2a.76.76 0 0 0-.76-.02L8.66 4.25v4.22l3.63 2.1a.77.77 0 0 0 .76 0l3.66-2.11zm3.84 5.34a4.56 4.56 0 0 1-2.37 3.96 4.6 4.6 0 0 1-4.18-.23l3.62-2.09a.76.76 0 0 0 .38-.66v-4.3l3.62 2.1a4.54 4.54 0 0 1-1.07 1.22zm-7.26-1.22l-2.9-1.68 2.9-1.67 2.9 1.67-2.9 1.68z"/>
      </svg>
    ),
  },
  {
    name: 'Google Gemini',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[38px] w-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 24C12 17.37 6.63 12 0 12C6.63 12 12 6.63 12 0C12 6.63 17.37 12 24 12C17.37 12 12 17.37 12 24Z" fill="url(#gemini-grad-strip)"/>
        <defs>
          <linearGradient id="gemini-grad-strip" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1A73E8"/>
            <stop offset="0.5" stopColor="#8AB4F8"/>
            <stop offset="1" stopColor="#9334E8"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: 'ElevenLabs',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[38px] w-auto text-[var(--ink-primary)]" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 5.5h3v13h-3zM10.5 3h3v18h-3zM16.5 7h3v10h-3z"/>
      </svg>
    ),
  },
  {
    name: 'Sarvam AI',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[38px] w-auto" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#FF6B00" strokeWidth="2.5"/>
        <path d="M8 12h8M12 8l4 4-4 4" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'DeepSeek',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[38px] w-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 18l8-14 8 14H4z" stroke="#0066FF" strokeWidth="2.2" strokeLinejoin="round"/>
        <circle cx="12" cy="13" r="2.5" fill="#0066FF"/>
      </svg>
    ),
  },
  {
    name: 'Mistral AI',
    icon: (
      <svg viewBox="0 0 24 24" fill="#FF7000" className="h-[38px] w-auto" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="4" height="4"/>
        <rect x="18" y="3" width="4" height="4"/>
        <rect x="6" y="7" width="4" height="4"/>
        <rect x="14" y="7" width="4" height="4"/>
        <rect x="10" y="11" width="4" height="4"/>
        <rect x="6" y="15" width="4" height="4"/>
        <rect x="14" y="15" width="4" height="4"/>
        <rect x="2" y="19" width="4" height="4"/>
        <rect x="18" y="19" width="4" height="4"/>
      </svg>
    ),
  },
  {
    name: 'Qwen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[38px] w-auto" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#615CED" strokeWidth="2.5"/>
        <path d="M12 7v5l3.5 3.5" stroke="#615CED" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'Grok (xAI)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[38px] w-auto text-[var(--ink-primary)]" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: 'n8n',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[38px] w-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12a4.5 4.5 0 0 1 8-2.6l1 1.1 1-1.1A4.5 4.5 0 1 1 21 12a4.5 4.5 0 0 1-8 2.6l-1-1.1-1 1.1A4.5 4.5 0 0 1 3 12z" stroke="#EA4B71" strokeWidth="2.5"/>
      </svg>
    ),
  },
  {
    name: 'Next.js',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[38px] w-auto text-[var(--ink-primary)]" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.632 17.728l-6.83-8.868v8.868H9.336V6.272h1.466l6.83 8.868V6.272h1.466v11.456h-1.466z"/>
      </svg>
    ),
  },
  {
    name: 'Three.js / WebGL',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[38px] w-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 20h20L12 2z" stroke="#049EF4" strokeWidth="2.2" strokeLinejoin="round"/>
        <path d="M12 8l-5 9h10l-5-9z" fill="#049EF4"/>
      </svg>
    ),
  },
  {
    name: 'WhatsApp Business API',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[38px] w-auto text-[#25D366]" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.175.201-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.894-.799-1.498-1.786-1.674-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.176.201-.301.301-.502.1-.201.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.239-.245-.588-.493-.508-.678-.517-.175-.008-.376-.01-.577-.01-.201 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.512 0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.145 4.549.719.311 1.28.497 1.718.636.722.23 1.378.197 1.898.12.579-.087 1.78-.728 2.031-1.431.251-.703.251-1.306.176-1.431-.075-.126-.276-.201-.577-.351zM12 2a9.93 9.93 0 0 0-8.528 15.064L2 22l5.068-1.328A9.94 9.94 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
      </svg>
    ),
  },
  {
    name: 'Twilio',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[38px] w-auto text-[#F22F46]" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-5.5 8a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm5.5 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm5.5 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm-5.5 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
      </svg>
    ),
  },
  {
    name: 'PostgreSQL & Supabase',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[38px] w-auto text-[#3ECF8E]" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.956 0c-6.603 0-11.956 5.353-11.956 11.956 0 6.604 5.353 11.956 11.956 11.956 6.604 0 11.956-5.352 11.956-11.956 0-6.603-5.352-11.956-11.956-11.956zm6.262 13.565l-6.104 7.973c-.22.288-.696.136-.707-.228l-.208-6.903h-3.41c-.347 0-.546-.395-.341-.676l6.104-7.973c.22-.288.696-.136.707.228l.208 6.903h3.41c.348 0 .546.395.341.676z"/>
      </svg>
    ),
  },
];

export const TechStackStrip: React.FC = () => {
  return (
    <section className="w-full py-10 border-y border-[var(--border-ink)]/15 bg-[var(--bg-canvas)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Static Two-Line Label on Left */}
          <div className="shrink-0 space-y-0.5">
            <h4 className="text-sm font-extrabold text-[var(--ink-primary)] tracking-tight">
              The tools behind the work.
            </h4>
            <p className="text-xs font-medium text-[var(--ink-secondary)]">
              Chosen to fit the task.
            </p>
          </div>

          {/* Scrolling Row of Pure Official Logos Only */}
          <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_40px,_black_calc(100%-40px),transparent_100%)]">
            <motion.div
              className="flex items-center gap-[4.5rem] w-max will-change-transform"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
            >
              {/* Duplicate array twice for continuous seamless infinite drift */}
              {[...TECH_LOGOS, ...TECH_LOGOS].map((tool, idx) => (
                <motion.div
                  key={`${tool.name}-${idx}`}
                  whileHover={{ scale: 1.25, y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="flex items-center justify-center shrink-0 cursor-default opacity-85 hover:opacity-100 transition-opacity"
                  title={tool.name}
                >
                  {tool.icon}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Subtle Footnote Caption */}
        <div className="mt-5 text-[10px] font-mono text-[var(--ink-secondary)]/70 text-center lg:text-left">
          Tool names and logos belong to their respective owners. Shown to identify tools we use; no affiliation or endorsement implied.
        </div>
      </div>
    </section>
  );
};
