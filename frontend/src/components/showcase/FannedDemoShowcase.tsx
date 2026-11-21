'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DEMO_PROJECTS, DemoProject } from '../../config/demos';
import {
  ExternalLink,
  X,
  Terminal,
  Cpu,
  Mic,
  MessageSquare,
  Video,
  Share2,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* LIVE ANIMATED CARD SIMULATION STAGES (AUTO-PLAYING 60FPS LOOPS)            */
/* -------------------------------------------------------------------------- */

// Card 01: AI Voice Receptionist Audio Waveform
const VoiceWaveformPreview: React.FC = () => {
  return (
    <div className="w-full h-24 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-ink)]/15 p-2.5 flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[var(--ink-primary)]">
          <Mic className="w-3 h-3 text-[#B4B0F5] animate-pulse" />
          <span>Active Telephony Stream</span>
        </span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
          &lt;380ms
        </span>
      </div>
      {/* 16 bouncing waveform bars */}
      <div className="flex items-end justify-between gap-1 h-10 px-1">
        {[40, 75, 25, 90, 60, 30, 85, 45, 95, 70, 35, 80, 50, 65, 30, 85].map((height, i) => (
          <motion.div
            key={i}
            className="w-full bg-[#B4B0F5] rounded-full"
            animate={{
              height: [`${Math.max(20, height * 0.4)}%`, `${height}%`, `${Math.max(15, height * 0.3)}%`],
            }}
            transition={{
              duration: 0.85 + (i % 4) * 0.15,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: i * 0.05,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Card 02: WhatsApp Sales & Catalog Concierge
const WhatsAppChatPreview: React.FC = () => {
  const [chatStep, setChatStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setChatStep((prev) => (prev + 1) % 3);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-24 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-ink)]/15 p-2.5 flex flex-col justify-between overflow-hidden text-[10px]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 font-mono font-bold text-[#25D366]">
          <MessageSquare className="w-3 h-3" />
          <span>WhatsApp Cloud API</span>
        </span>
        <span className="text-[9px] font-mono text-[var(--ink-secondary)]">Live Lead</span>
      </div>
      <div className="space-y-1.5">
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-[var(--bg-surface)] px-2 py-1 rounded-md max-w-[85%] text-[var(--ink-secondary)] border border-[var(--border-ink)]/10 truncate"
        >
          {chatStep === 0
            ? '"Need custom pricing for 50k users"'
            : chatStep === 1
            ? '"Sending real-time quotation..."'
            : '"Quote generated · Meeting scheduled"'}
        </motion.div>
        <motion.div
          animate={{ scale: [0.98, 1, 0.98] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="bg-[#25D366]/20 text-[#111111] dark:text-[#FAF9F5] px-2 py-1 rounded-md ml-auto max-w-[88%] font-semibold border border-[#25D366]/40 flex items-center justify-between"
        >
          <span className="truncate">Proposal sent · Meet booked ✓✓</span>
        </motion.div>
      </div>
    </div>
  );
};

// Card 03: Interactive 3D WebGL Conversion Engine
const WebGL3DPreview: React.FC = () => {
  return (
    <div className="w-full h-24 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-ink)]/15 p-2.5 flex items-center justify-between overflow-hidden">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <motion.svg
          viewBox="0 0 100 100"
          className="w-14 h-14"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
        >
          <polygon
            points="50,15 85,35 85,75 50,95 15,75 15,35"
            fill="none"
            stroke="#B4B0F5"
            strokeWidth="3"
          />
          <line x1="50" y1="15" x2="50" y2="55" stroke="#E2C870" strokeWidth="2.5" />
          <line x1="50" y1="55" x2="85" y2="35" stroke="#E2C870" strokeWidth="2.5" />
          <line x1="50" y1="55" x2="15" y2="35" stroke="#E2C870" strokeWidth="2.5" />
          <line x1="50" y1="55" x2="50" y2="95" stroke="#B4B0F5" strokeWidth="2" strokeDasharray="3 3" />
        </motion.svg>
      </div>
      <div className="flex flex-col text-right space-y-0.5">
        <span className="text-[10px] font-mono font-bold text-emerald-500">60 FPS</span>
        <span className="text-[9px] font-mono text-[var(--ink-secondary)]">Three.js / R3F</span>
        <span className="text-[9px] font-mono text-[var(--ink-primary)] font-bold">Sub-0.4s Paint</span>
      </div>
    </div>
  );
};

// Card 04: AI Video & Motion Graphics Pipeline
const VideoPipelinePreview: React.FC = () => {
  return (
    <div className="w-full h-24 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-ink)]/15 p-2.5 flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[var(--ink-primary)]">
          <Video className="w-3 h-3 text-[#E2C870]" />
          <span>Auto-Video Pipeline</span>
        </span>
        <span className="text-[9px] font-mono font-bold text-[#E2C870]">Remotion</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px] font-mono text-[var(--ink-secondary)]">
          <span>Encoding 9:16 vertical clip...</span>
          <span className="text-[var(--ink-primary)] font-bold">100%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#E2C870]"
            animate={{ width: ['10%', '100%'] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
};

// Card 05: OpenClaw Multi-Agent Slack/Telegram Ops
const AgentNetworkPreview: React.FC = () => {
  return (
    <div className="w-full h-24 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-ink)]/15 p-2.5 flex items-center justify-between overflow-hidden">
      <div className="flex items-center justify-around w-full">
        {/* Node 1: Slack */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-lg bg-[#4A154B] text-white flex items-center justify-center font-bold text-[9px] shadow-sm">
            #
          </div>
          <span className="text-[8px] font-mono text-[var(--ink-secondary)]">Slack</span>
        </div>
        {/* Animated Connector 1 */}
        <div className="h-0.5 w-6 bg-[#B4B0F5] relative overflow-hidden">
          <motion.div
            className="h-full w-2 bg-[#111111] dark:bg-white"
            animate={{ x: [-8, 24] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        {/* Node 2: OpenClaw Hub */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-8 h-8 rounded-full bg-[#B4B0F5] text-[#111111] border border-[#111111] flex items-center justify-center font-bold text-[9px] shadow-sm">
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[8px] font-mono text-[var(--ink-primary)] font-bold">OpenClaw</span>
        </motion.div>
        {/* Animated Connector 2 */}
        <div className="h-0.5 w-6 bg-[#E2C870] relative overflow-hidden">
          <motion.div
            className="h-full w-2 bg-[#111111] dark:bg-white"
            animate={{ x: [-8, 24] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', delay: 0.7 }}
          />
        </div>
        {/* Node 3: CRM */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-lg bg-[#18181B] text-white flex items-center justify-center font-bold text-[9px] shadow-sm">
            SQL
          </div>
          <span className="text-[8px] font-mono text-[var(--ink-secondary)]">Postgres</span>
        </div>
      </div>
    </div>
  );
};

// Card 06: Live Profit Dashboard & Quoting Engine
const ProfitDashboardPreview: React.FC = () => {
  return (
    <div className="w-full h-24 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-ink)]/15 p-2.5 flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[var(--ink-primary)]">
          <BarChart3 className="w-3 h-3 text-emerald-500" />
          <span>Real-Time P&amp;L</span>
        </span>
        <span className="text-[10px] font-mono font-bold text-emerald-500">+38.4%</span>
      </div>
      <div className="flex items-end justify-between h-8 px-1">
        {[20, 35, 30, 48, 42, 60, 55, 75, 70, 88, 82, 100].map((h, i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-[#E2C870] rounded-t-sm"
            animate={{ height: [`${Math.max(15, h * 0.6)}%`, `${h}%`, `${Math.max(20, h * 0.7)}%`] }}
            transition={{
              duration: 1.2 + (i % 3) * 0.2,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.08,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const FAN_ROTATIONS = [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5];
const FAN_OFFSETS_Y = [18, 8, 0, 0, 8, 18];

interface FannedDemoShowcaseProps {
  onOpenContact?: () => void;
}

export const FannedDemoShowcase: React.FC<FannedDemoShowcaseProps> = ({ onOpenContact }) => {
  const [selectedDemo, setSelectedDemo] = useState<DemoProject | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Auto-spotlight cycle every 2.8s when not hovered
  useEffect(() => {
    if (hoveredIndex !== null) return;
    const interval = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % DEMO_PROJECTS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [hoveredIndex]);

  const handleCardClick = (demo: DemoProject) => {
    if (demo.demoUrl && demo.demoUrl.trim().length > 0) {
      window.open(demo.demoUrl, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedDemo(demo);
    }
  };

  const renderCardPreview = (id: string) => {
    switch (id) {
      case 'voice-agent':
        return <VoiceWaveformPreview />;
      case 'whatsapp-concierge':
        return <WhatsAppChatPreview />;
      case 'conversion-web':
        return <WebGL3DPreview />;
      case 'ai-video-workflow':
        return <VideoPipelinePreview />;
      case 'openclaw-harness':
        return <AgentNetworkPreview />;
      case 'custom-erp-saas':
        return <ProfitDashboardPreview />;
      default:
        return null;
    }
  };

  return (
    <section id="demos" className="w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--border-ink)]/20 bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] mb-4">
          <span>03 / PORTFOLIO &amp; LIVE HARNESSES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--ink-primary)]">
          Fanned Live Demo Showcase
        </h2>
        <p className="mt-4 text-base text-[var(--ink-secondary)] leading-relaxed">
          Six battle-tested agent topologies self-running in real time. Click any card to launch the live sandbox or inspect the architectural harness.
        </p>
      </motion.div>

      {/* Relative Fanned Arc Container */}
      <div className="relative w-full max-w-6xl mx-auto pt-8 pb-14">
        {/* Floating Speech-Bubble Callout Pill: Left */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-4 sm:left-12 z-20 transform -rotate-6 pointer-events-none"
        >
          <div className="px-4 py-2 rounded-2xl bg-[#B4B0F5] text-[#111111] font-bold text-xs sm:text-sm border-[1.5px] border-[#111111] shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#111111] animate-ping" />
            <span>Live Agent Sandboxes</span>
          </div>
        </motion.div>

        {/* Floating Speech-Bubble Callout Pill: Right */}
        <motion.div
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-2 right-4 sm:right-12 z-20 transform rotate-6 pointer-events-none"
        >
          <div className="px-4 py-2 rounded-2xl bg-[#E2C870] text-[#111111] font-bold text-xs sm:text-sm border-[1.5px] border-[#111111] shadow-lg flex items-center gap-2">
            <span>Drop-In Demo Links Ready</span>
            <span className="font-mono text-xs">src/config/demos.ts</span>
          </div>
        </motion.div>

        {/* The 6 Fanned Cards Grid / Arc with Staggered Entrance & Dynamic Hover Spring */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 pt-10">
          {DEMO_PROJECTS.map((demo, index) => {
            const baseRot = FAN_ROTATIONS[index] ?? 0;
            const baseY = FAN_OFFSETS_Y[index] ?? 0;
            const isSpotlight = hoveredIndex === null && spotlightIndex === index;
            const isHovered = hoveredIndex === index;

            // Compute adjacent cards parting offset
            let offsetX = 0;
            if (hoveredIndex !== null) {
              if (index < hoveredIndex) offsetX = -14;
              else if (index > hoveredIndex) offsetX = 14;
            }

            return (
              <motion.article
                key={demo.id}
                onClick={() => handleCardClick(demo)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                initial={{
                  opacity: 0,
                  y: baseY + 30,
                  rotate: baseRot,
                }}
                whileInView={{
                  opacity: 1,
                  y: isSpotlight ? -18 : baseY,
                  rotate: isSpotlight ? 0 : baseRot,
                  scale: isSpotlight ? 1.05 : 1,
                  x: offsetX,
                }}
                animate={{
                  y: isHovered ? -34 : isSpotlight ? -18 : baseY,
                  rotate: isHovered ? 0 : isSpotlight ? 0 : baseRot,
                  scale: isHovered ? 1.12 : isSpotlight ? 1.05 : 1,
                  x: offsetX,
                  zIndex: isHovered ? 50 : isSpotlight ? 30 : 10,
                }}
                whileHover={{
                  scale: 1.12,
                  y: -34,
                  rotate: 0,
                  zIndex: 50,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                viewport={{ once: true }}
                transition={{
                  type: 'spring',
                  stiffness: isHovered ? 360 : 260,
                  damping: isHovered ? 18 : 20,
                  mass: 0.75,
                  delay: index * 0.07,
                }}
                className={`group relative cursor-pointer rounded-2xl border-[1.5px] p-5 flex flex-col justify-between min-h-[380px] shadow-lg transition-colors will-change-transform ${
                  isHovered || isSpotlight
                    ? 'border-[#E2C870] bg-[var(--bg-surface)] shadow-[0_25px_50px_-12px_rgba(226,200,112,0.35)] dark:shadow-[0_25px_50px_-12px_rgba(180,176,245,0.25)] ring-2 ring-[#E2C870]/40'
                    : 'border-[var(--border-ink)] bg-[var(--bg-surface)]'
                }`}
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[var(--ink-secondary)]">
                      SLOT {demo.slotNumber}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full border border-[#111111]"
                      style={{ backgroundColor: demo.accentColor }}
                    />
                  </div>

                  <span className="mt-3 block text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-secondary)]">
                    {demo.category}
                  </span>

                  <h3 className="mt-2 text-base font-extrabold text-[var(--ink-primary)] group-hover:text-[#8883d6] transition-colors leading-snug">
                    {demo.title}
                  </h3>

                  <p className="mt-2 text-xs text-[var(--ink-secondary)] leading-relaxed line-clamp-2">
                    {demo.description}
                  </p>
                </div>

                {/* Live Self-Running Simulation Stage */}
                <div className="my-3">
                  {renderCardPreview(demo.id)}
                </div>

                {/* Card Footer: Tech Stack + Launch Badge */}
                <div className="pt-3 border-t border-[var(--border-ink)]/15 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {demo.techStack.slice(0, 2).map((tech) => (
                      <span
                        key={tech}
                        className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--ink-secondary)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-[var(--ink-primary)]">
                    <span className="text-[10px] font-mono text-[#4A4A52] dark:text-[#A1A1AA]">
                      {demo.metrics}
                    </span>
                    <div className="w-6 h-6 rounded-full border border-[var(--border-ink)] flex items-center justify-center group-hover:bg-[#111111] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#111111] transition-colors">
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Demo Architecture Modal */}
      <AnimatePresence>
        {selectedDemo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-xl rounded-3xl border-[2px] border-[var(--border-ink)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-2xl text-[var(--ink-primary)]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDemo(null)}
                className="absolute top-5 right-5 p-2 rounded-full border border-[var(--border-ink)]/20 hover:bg-[var(--bg-elevated)]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Content */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#E2C870] text-[#111111]">
                  SLOT {selectedDemo.slotNumber}
                </span>
                <span className="text-xs font-mono text-[var(--ink-secondary)]">
                  {selectedDemo.category}
                </span>
              </div>

              <h3 className="mt-3 text-2xl font-black text-[var(--ink-primary)]">
                {selectedDemo.title}
              </h3>

              <p className="mt-2 text-sm text-[var(--ink-secondary)] leading-relaxed">
                {selectedDemo.description}
              </p>

              {/* Live Link Slot Helper Alert for Founders / Clients */}
              <div className="mt-6 rounded-2xl border-[1.5px] border-dashed border-[var(--border-ink)]/40 bg-[var(--bg-elevated)] p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--ink-primary)]">
                  <Terminal className="w-4 h-4 text-[#8883d6]" />
                  <span>Live URL Integration Slot Ready</span>
                </div>
                <p className="text-xs text-[var(--ink-secondary)]">
                  This project slot is pre-wired. Agency leads can paste their deployed demonstration URL in:
                </p>
                <code className="block text-[11px] font-mono px-2.5 py-1.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-ink)]/15 text-[var(--ink-primary)]">
                  src/config/demos.ts → demoUrl: &apos;https://your-demo-url.com&apos;
                </code>
              </div>

              {/* Tech Stack Specs */}
              <div className="mt-6 space-y-2">
                <span className="text-xs font-mono font-bold text-[var(--ink-secondary)] uppercase">
                  Architecture Blueprint
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedDemo.techStack.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[var(--border-ink)]/20 text-xs font-semibold bg-[var(--bg-surface)]"
                    >
                      <Cpu className="w-3.5 h-3.5 text-[#E2C870]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedDemo(null)}
                  className="px-5 py-2.5 rounded-full border border-[var(--border-ink)]/30 text-xs font-bold hover:bg-[var(--bg-elevated)]"
                >
                  Close Window
                </button>
                <button
                  onClick={() => {
                    setSelectedDemo(null);
                    if (onOpenContact) onOpenContact();
                  }}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#111111] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] text-xs font-bold hover:scale-105 active:scale-95 transition-transform"
                >
                  <span>Contact Us for Deployment</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
