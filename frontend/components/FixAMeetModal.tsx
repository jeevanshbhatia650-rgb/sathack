"use client";

import React, { useState } from "react";
import { X, Calendar, CheckCircle2, Clock, Send, Sparkles, AlertCircle } from "lucide-react";
import { SOLUTIONS_LIST } from "@/components/ContactForm";

interface FixAMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export default function FixAMeetModal({ isOpen, onClose, defaultService }: FixAMeetModalProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    contact: "",
    dateTime: "",
    serviceInterest: defaultService || SOLUTIONS_LIST[0].value,
    notes: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [meetingResult, setMeetingResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/webhook/fix-a-meet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule meeting.");
      }

      setMeetingResult(data);
      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.4)] backdrop-blur-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Radial Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {status === "success" ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-white">Meeting Reserved!</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Your sprint consultation has been confirmed and logged directly into the Supabase <strong>meetings</strong> database.
            </p>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Meeting Reference:</span>
                <span className="font-mono font-bold text-blue-400">{meetingResult?.meetingId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Requested Window:</span>
                <span className="font-bold text-slate-200">{formData.dateTime}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Target Solution:</span>
                <span className="font-bold text-slate-200">{formData.serviceInterest}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setStatus("idle");
                onClose();
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Fix A Meet Webhook
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Schedule Architecture Consultation
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Direct sprint booking. Appends instantly to your Supabase PostgreSQL CRM under the <strong>meetings</strong> table.
              </p>
            </div>

            {status === "error" && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Contact (Email / Phone) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="alex@company.com or +1..."
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Preferred Date &amp; Time Window *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tuesday Nov 17 at 2:00 PM PST"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Solution Interest
                </label>
                <select
                  value={formData.serviceInterest}
                  onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {SOLUTIONS_LIST.map((s, idx) => (
                    <option key={idx} value={s.value} className="bg-slate-900 text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Meeting Agenda / Key Questions
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us what you want to achieve or automate..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 border border-white/20 disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <span>Registering with Webhook...</span>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Confirm &amp; Fix This Meet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

