"use client";

import React from "react";
import { ExternalLink, CheckCircle2, Shield, Sparkles } from "lucide-react";

interface ShowcaseProject {
  title: string;
  tagline: string;
  url: string;
  displayUrl: string;
  metrics: string;
  type: string;
  imageSrc?: string;
  fallbackGradient?: string;
  accentColor: string;
}

const PROJECTS: ShowcaseProject[] = [
  {
    title: "David A+ Salon",
    tagline: "High-Ticket Local Conversion Engine with automated 24/7 AI booking",
    url: "https://david-a-plus.vercel.app/",
    displayUrl: "david-a-plus.vercel.app",
    metrics: "+140% Inbound Bookings · $0 SaaS Seats",
    type: "Local Business Automation",
    imageSrc: "/david-a-plus.png",
    accentColor: "from-blue-600 to-indigo-600",
  },
  {
    title: "ExpoUp Agentic CRM",
    tagline: "Next-gen Autonomous CRM & Outbound Pipeline with real-time leads",
    url: "https://expoup-agentic-crm-antigravity-kit.vercel.app/",
    displayUrl: "expoup-agentic-crm.vercel.app",
    metrics: "24/7 Agentic Routing · Headless Sheets CRM",
    type: "AI Pipeline & Operations",
    imageSrc: "/expoup-crm.png",
    accentColor: "from-purple-600 to-pink-600",
  },
  {
    title: "Kittitas Cafe",
    tagline: "Live customer food & beverage ordering with instant menu sync",
    url: "https://kittitascafe.com/",
    displayUrl: "kittitascafe.com",
    metrics: "Zero Downtime · Live Table & Takeout POS",
    type: "Hospitality Commerce",
    fallbackGradient: "linear-gradient(135deg, #1C1917 0%, #292524 50%, #78350F 100%)",
    accentColor: "from-amber-600 to-orange-600",
  },
];

export default function LiveShowcase() {
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-20">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Verified Deployments
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Production Systems in the Wild
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Every platform is delivered into client cloud accounts with 100% source code ownership, zero per-seat licensing, and automated data pipelines.
        </p>
      </div>

      {/* Grid of Lake Square Browser Window Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {PROJECTS.map((proj, idx) => (
          <div
            key={idx}
            className="group relative flex flex-col rounded-3xl bg-slate-900/90 border border-white/10 overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(59,130,246,0.35)] hover:border-blue-500/40"
          >
            {/* Top Browser Header (macOS window style) */}
            <div className="px-5 py-3.5 bg-slate-950/90 border-b border-white/10 flex items-center justify-between">
              {/* Traffic Lights */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>

              {/* URL Address Bar */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-[11px] font-mono text-slate-300 max-w-[210px] truncate">
                <span className="text-emerald-400">🔒</span>
                <span className="truncate">{proj.displayUrl}</span>
              </div>

              {/* Live Badge */}
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Live</span>
              </div>
            </div>

            {/* Lake Square Browser Body: Partial UI View */}
            <div className="relative w-full aspect-[4/3] bg-slate-950 overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
              {proj.imageSrc ? (
                <img
                  src={proj.imageSrc}
                  alt={proj.title}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col justify-between p-5 text-white relative font-sans"
                  style={{ 
                    background: "radial-gradient(circle at top right, #382216 0%, #1c140e 50%, #0d0a08 100%)" 
                  }}
                >
                  {/* Café Web App Bar */}
                  <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">☕</span>
                      <div>
                        <span className="text-xs font-black tracking-wider uppercase text-amber-200 block">Kittitas Cafe</span>
                        <span className="text-[9px] text-amber-400/80 font-mono">Artisan Roastery &amp; Kitchen</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                        ● Open Now
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                        Cart (2)
                      </span>
                    </div>
                  </div>

                  {/* Partial Menu Item Grid */}
                  <div className="grid grid-cols-2 gap-2.5 my-auto">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">Espresso</span>
                      <h5 className="text-xs font-black text-white">Cold Brew Float</h5>
                      <span className="text-xs font-mono font-bold text-emerald-400 mt-1 block">$5.25</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">Bakery</span>
                      <h5 className="text-xs font-black text-white">Almond Brioche</h5>
                      <span className="text-xs font-mono font-bold text-emerald-400 mt-1 block">$4.75</span>
                    </div>
                  </div>

                  {/* Ordering & POS Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-amber-900/40 text-[10px] text-amber-200">
                    <span className="flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Live Kitchen POS
                    </span>
                    <span className="font-mono text-slate-300 font-bold bg-white/10 px-2 py-0.5 rounded">
                      Table &amp; Curbside Pickup
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Subtle Overlay Shadow */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none" />
            </div>

            {/* Card Content & Testimonial Metrics */}
            <div className="p-6 flex flex-col justify-between flex-1 bg-slate-900/90 border-t border-white/5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                    {proj.type}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    {proj.metrics}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {proj.tagline}
                </p>
              </div>

              {/* Action Link Button */}
              <a
                href={proj.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 text-xs font-bold text-white transition-all duration-300 group/btn"
              >
                <span>Launch Live System</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </a>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
