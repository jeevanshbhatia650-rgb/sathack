"use client";

import React from "react";
import { Calendar, ArrowRight, FileText } from "lucide-react";

interface NavbarProps {
  onOpenFixMeet?: () => void;
}

export default function Navbar({ onOpenFixMeet }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#08090C]/90 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand Tag — Webwink */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.45)] group-hover:scale-105 transition-transform">
            <span className="font-black text-lg text-slate-950 font-mono">W</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-white block leading-tight">
                WEBWINK
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                ®
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              2026 Commercial Engine
            </span>
          </div>
        </a>

        {/* Center: Neo-Editorial Capsule Navigation Pills (From Image 1) */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-inner text-xs font-bold text-slate-300">
          <a
            href="/sathack"
            className="px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all font-mono"
          >
            Orchestrator
          </a>
          <a
            href="#"
            className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all"
          >
            Studio
          </a>
          <a
            href="#services"
            className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all"
          >
            Rate Card
          </a>
          <a
            href="#guarantees"
            className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all"
          >
            Guarantees
          </a>
          <a
            href="#live-showcase"
            className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all"
          >
            Deployments
          </a>
          <a
            href="#tech-stack"
            className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all"
          >
            Tech Stack
          </a>
          <a
            href="#contact"
            className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all"
          >
            Contact
          </a>
        </nav>

        {/* Right: Docs Link & Fix-A-Meet Action Button */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/jeevanshbhatia650-rgb/agency_brochure"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Docs</span>
          </a>

          <button
            onClick={onOpenFixMeet}
            className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.55)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 outline-none border border-amber-300/40 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>Fix a Meet</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </header>
  );
}
