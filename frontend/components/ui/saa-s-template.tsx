'use client';

import React from "react";
import { ArrowRight, Menu, X } from "lucide-react";

// Inline Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "gradient";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className = "", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
    
    const variants = {
      default: "bg-white text-black hover:bg-gray-100 shadow-sm",
      secondary: "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700/60",
      ghost: "hover:bg-gray-800/50 text-white",
      gradient: "bg-gradient-to-b from-white via-white/95 to-white/70 text-black shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98]"
    };
    
    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-9 px-4 text-xs",
      lg: "h-12 px-8 text-base font-semibold"
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Navigation Component
export const Navigation = React.memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 w-full z-50 border-b border-gray-800/60 bg-black/85 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Sathack<span className="text-cyan-400">.ai</span></span>
          </div>
          
          <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <a href="#getting-started" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Getting started
            </a>
            <a href="#components" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Components
            </a>
            <a href="#orchestrator" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Orchestrator
            </a>
            <a href="#documentation" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Documentation
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button type="button" variant="ghost" size="sm">
              Sign in
            </Button>
            <Button type="button" variant="default" size="sm">
              Launch Agent
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800/50 animate-[slideDown_0.3s_ease-out]">
          <div className="px-6 py-4 flex flex-col gap-4">
            <a
              href="#getting-started"
              className="text-sm text-white/60 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Getting started
            </a>
            <a
              href="#components"
              className="text-sm text-white/60 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Components
            </a>
            <a
              href="#orchestrator"
              className="text-sm text-white/60 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Orchestrator
            </a>
            <a
              href="#documentation"
              className="text-sm text-white/60 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Documentation
            </a>
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-800/50">
              <Button type="button" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button type="button" variant="default" size="sm">
                Launch Agent
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

Navigation.displayName = "Navigation";

// Hero Component
export const Hero = React.memo(() => {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-28 pb-16 md:pt-36 overflow-hidden"
      style={{
        animation: "fadeIn 0.6s ease-out"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        
        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Subtle Background Glow Ambient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/10 to-amber-500/10 blur-[130px] pointer-events-none -z-10" />

      <aside className="mb-8 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-gray-700/80 bg-gray-900/60 backdrop-blur-md max-w-full shadow-inner shadow-white/5">
        <span className="text-xs font-medium text-gray-300">
          Sathack Agentic Kit v2.4 live
        </span>
        <span className="text-gray-600">|</span>
        <a
          href="#orchestrator"
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-all active:scale-95 whitespace-nowrap"
          aria-label="Read more about orchestrator engine"
        >
          Explore Orchestrator
          <ArrowRight size={12} />
        </a>
      </aside>

      <h1
        className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-center max-w-4xl px-4 leading-[1.08] mb-6 tracking-tight"
        style={{
          background: "linear-gradient(to bottom, #ffffff, #ffffff 60%, rgba(255, 255, 255, 0.65))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.04em"
        }}
      >
        Autonomous Agent Orchestrator <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-300">
          Built for Modern Infrastructure
        </span>
      </h1>

      <p className="text-sm md:text-base text-center max-w-2xl px-6 mb-10 text-gray-400 font-normal leading-relaxed">
        Plug in your GitHub repositories, orchestrate real-time Docker container builds, inspect live Pixelate telemetry streams, and generate verifiable release artifacts in seconds.
      </p>

      <div className="flex items-center gap-4 relative z-10 mb-14">
        <Button
          type="button"
          variant="gradient"
          size="lg"
          className="rounded-xl flex items-center justify-center shadow-lg shadow-white/10"
          aria-label="Get started with the template"
          onClick={() => {
            const el = document.getElementById('orchestrator-app-view');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Deploy Orchestrator
          <ArrowRight size={16} />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="rounded-xl"
          onClick={() => window.open('https://github.com/jeevanshbhatia650-rgb/sathack', '_blank')}
        >
          View GitHub
        </Button>
      </div>

      <div className="w-full max-w-5xl relative pb-20">
        <div
          className="absolute left-1/2 w-[95%] pointer-events-none z-0 opacity-70"
          style={{
            top: "-22%",
            transform: "translateX(-50%)"
          }}
          aria-hidden="true"
        >
          {/* High-res backdrop glow and mesh */}
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="w-full h-auto rounded-3xl blur-2xl opacity-40 mix-blend-screen"
            loading="eager"
          />
        </div>
        
        <div className="relative z-10 rounded-2xl p-1.5 bg-gradient-to-b from-white/20 via-white/5 to-transparent shadow-2xl border border-white/10 backdrop-blur-xl">
          <div className="overflow-hidden rounded-xl bg-gray-950 border border-gray-800/80 shadow-2xl">
            {/* Top window chrome */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900/90 border-b border-gray-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-xs font-mono text-gray-400">sathack-orchestrator-core · cluster-eu-central-1</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Dual Nodes Active
                </span>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85"
              alt="Dashboard preview showing analytics and metrics interface"
              className="w-full h-[420px] md:h-[540px] object-cover object-top filter brightness-90 contrast-105"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

// Main Component
export default function Component() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-black">
      <Navigation />
      <Hero />
    </main>
  );
}
