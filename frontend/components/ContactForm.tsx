"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";

export const SOLUTIONS_LIST = [
  { value: "Live Business Dashboards", label: "01. Live Business Dashboards — $699 Build ($149/mo care)" },
  { value: "Custom Animated Websites", label: "02. Custom Animated Websites — $899 Build ($179/mo care)" },
  { value: "Smart AI Websites (24/7 Q&A)", label: "03. Smart AI Websites (24/7 Q&A) — $1,299 Build ($279/mo care)" },
  { value: "AI Sales & Product Chatbots", label: "04. AI Sales & Product Chatbots — $1,599 Build ($349/mo care)" },
  { value: "Automated Lead Engines", label: "05. Automated Lead Engines — $1,899 Build ($449/mo care)" },
  { value: "Smart AI & Standard CRMs", label: "06. Smart AI & Standard CRMs — $2,499 Build ($549/mo care)" },
  { value: "All-In-One Growth Stack", label: "Growth Stack Bundle — $4,499 Build ($999/mo care)" },
];

export const BUDGET_TIERS = [
  "$1,000 – $2,500 (Single Core Build)",
  "$2,500 – $5,000 (Multi-System Automation)",
  "$5,000 – $10,000 (Complete Growth Stack)",
  "$10,000+ (Enterprise Custom Integration)",
];

interface ContactFormProps {
  selectedSolution?: string;
}

export default function ContactForm({ selectedSolution }: ContactFormProps) {
  const [formData, setFormData] = useState({
    personName: "",
    contact: "",
    solutionRequired: selectedSolution || SOLUTIONS_LIST[0].value,
    customisationRequired: "",
    budget: BUDGET_TIERS[0],
  });

  React.useEffect(() => {
    if (selectedSolution) {
      setFormData(prev => ({ ...prev, solutionRequired: selectedSolution }));
    }
  }, [selectedSolution]);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setStatusMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setStatus("success");
      setStatusMessage(data.message);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setStatusMessage(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-20">
      
      {/* Container Card in Dark SaaS Glossy Style */}
      <div className="bg-slate-900/90 rounded-3xl p-8 sm:p-12 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl relative overflow-hidden">
        
        {/* Subtle Accent Radial Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-2xl mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Direct Scope &amp; CRM Sync
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Lock In Your Production Sprint
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Tell us about your business and required automations. We operate on strict 50/50 milestone billing with 100% code ownership.
          </p>
        </div>

        {status === "success" ? (
          <div className="p-8 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center animate-fade-in relative z-10">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Request Processed Successfully</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-4">
              Thank you, {formData.personName}. Your inquiry for <strong>{formData.solutionRequired}</strong> has been logged to the pipeline.
            </p>
            <p className="text-xs text-emerald-400 font-mono mb-6">
              {statusMessage}
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                setFormData({
                  personName: "",
                  contact: "",
                  solutionRequired: SOLUTIONS_LIST[0].value,
                  customisationRequired: "",
                  budget: BUDGET_TIERS[0],
                });
              }}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            {/* Person & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Person (Your Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Vance"
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm text-white bg-black/40 backdrop-blur-md transition-all outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Contact (Email or Phone) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. david@agency.com or (408) 555-0199"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm text-white bg-black/40 backdrop-blur-md transition-all outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Solution Required */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Solution Required *
              </label>
              <select
                value={formData.solutionRequired}
                onChange={(e) => setFormData({ ...formData, solutionRequired: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm text-white bg-slate-950 transition-all outline-none cursor-pointer"
              >
                {SOLUTIONS_LIST.map((sol) => (
                  <option key={sol.value} value={sol.value} className="bg-slate-950 text-white">
                    {sol.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Customisation Required */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Customisation Required
              </label>
              <textarea
                rows={3}
                placeholder="Mention specific integrations (Shopify, QuickBooks, Google Sheets), bespoke AI prompts, or team seat volume..."
                value={formData.customisationRequired}
                onChange={(e) => setFormData({ ...formData, customisationRequired: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm text-white bg-black/40 backdrop-blur-md transition-all outline-none resize-none placeholder:text-slate-500"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Budget Range *
              </label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm text-white bg-slate-950 transition-all outline-none cursor-pointer"
              >
                {BUDGET_TIERS.map((tier) => (
                  <option key={tier} value={tier} className="bg-slate-950 text-white">
                    {tier}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {status === "error" && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-950/60 text-rose-300 text-xs font-medium border border-rose-500/40">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Submit & Guarantees */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed outline-none border border-white/20"
              >
                <Send className="w-4 h-4" />
                <span>{status === "loading" ? "Syncing to CRM..." : "Send Proposal Request"}</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>50/50 Milestone · Zero Vendor Lock-in</span>
              </div>
            </div>

          </form>
        )}

      </div>
    </section>
  );
}
