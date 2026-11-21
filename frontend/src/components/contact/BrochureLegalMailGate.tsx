'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LEGAL_CLAUSES } from '../../config/legalClauses';
import { generateBrochurePdf } from '../../utils/generateBrochurePdf';
import { useGeoPricing } from '../../hooks/useGeoPricing';
import {
  FileText,
  ShieldCheck,
  CheckSquare,
  Square,
  ArrowRight,
  Send,
  X,
  Lock,
  Download,
  AlertCircle,
} from 'lucide-react';

interface FormData {
  fullName: string;
  workEmail: string;
  companyName: string;
  selectedTier: string;
  projectBrief: string;
}

export const BrochureLegalMailGate: React.FC = () => {
  const { region, isIndia } = useGeoPricing();

  const [form, setForm] = useState<FormData>({
    fullName: '',
    workEmail: '',
    companyName: '',
    selectedTier: '14-Day Core System Sprint',
    projectBrief: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brochureDownloaded, setBrochureDownloaded] = useState(false);
  const [legalClausesAccepted, setLegalClausesAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    receiptId: string;
    acceptanceHash: string;
    submittedAt: string;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateStep1 = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!form.fullName.trim()) errors.fullName = 'Full name is required';
    if (!form.workEmail.trim() || !form.workEmail.includes('@'))
      errors.workEmail = 'Valid work email is required';
    if (!form.companyName.trim()) errors.companyName = 'Company name is required';
    if (!form.projectBrief.trim() || form.projectBrief.length < 5)
      errors.projectBrief = 'Please provide a brief description of your project';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Proceed = () => {
    if (!validateStep1()) return;

    // Automatically trigger Brochure PDF generation and download
    try {
      const doc = generateBrochurePdf(region);
      doc.save(`WebWink-2026-Commercial-Brochure-${region}.pdf`);
      setBrochureDownloaded(true);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
    }

    // Open the 6 Legal Clauses Review Gate
    setIsModalOpen(true);
  };

  const handleFinalDispatch = async () => {
    if (!legalClausesAccepted) return;
    setSubmitting(true);
    setServerError(null);

    const idempotencyKey = uuidv4();
    const payload = {
      fullName: form.fullName,
      workEmail: form.workEmail,
      companyName: form.companyName,
      selectedTier: form.selectedTier,
      region,
      projectBrief: form.projectBrief,
      brochureDownloaded: true,
      legalClausesAccepted: true,
      acceptedTimestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to submit inquiry');
      }

      setSubmissionReceipt({
        receiptId: data.receiptId,
        acceptanceHash: data.acceptanceHash,
        submittedAt: data.submittedAt,
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setServerError(err.message || 'Submission error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="legal-gate" className="w-full py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--border-ink)]/20 bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] mb-4">
          <Lock className="w-3.5 h-3.5 text-[#B4B0F5]" />
          <span>06 / COMMERCIAL BROCHURE & LEGAL GATE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--ink-primary)]">
          Initiate Official Inquiry
        </h2>
        <p className="mt-3 text-base text-[var(--ink-secondary)] leading-relaxed">
          Step 1 generates your localized 2026 Commercial Brochure and opens the 6 binding legal clauses for transparent review.
        </p>
      </div>

      {/* Main Scope Form Card */}
      <div className="rounded-3xl border-2 border-[var(--border-ink)] bg-[var(--bg-surface)] p-8 sm:p-12 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[var(--ink-secondary)] uppercase">
              Full Name *
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="e.g. Alex Rivera"
              className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--border-ink)]/25 bg-[var(--bg-canvas)] text-[var(--ink-primary)] focus:outline-none focus:border-[#B4B0F5]"
            />
            {formErrors.fullName && (
              <span className="text-xs text-rose-500 font-medium">
                {formErrors.fullName}
              </span>
            )}
          </div>

          {/* Work Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[var(--ink-secondary)] uppercase">
              Work Email *
            </label>
            <input
              type="email"
              value={form.workEmail}
              onChange={(e) => setForm({ ...form, workEmail: e.target.value })}
              placeholder="alex@company.com"
              className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--border-ink)]/25 bg-[var(--bg-canvas)] text-[var(--ink-primary)] focus:outline-none focus:border-[#B4B0F5]"
            />
            {formErrors.workEmail && (
              <span className="text-xs text-rose-500 font-medium">
                {formErrors.workEmail}
              </span>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[var(--ink-secondary)] uppercase">
              Company Name *
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="Acme Corp / Studio X"
              className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--border-ink)]/25 bg-[var(--bg-canvas)] text-[var(--ink-primary)] focus:outline-none focus:border-[#B4B0F5]"
            />
            {formErrors.companyName && (
              <span className="text-xs text-rose-500 font-medium">
                {formErrors.companyName}
              </span>
            )}
          </div>

          {/* Target Sprint Tier */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[var(--ink-secondary)] uppercase">
              Selected Sprint Tier
            </label>
            <select
              value={form.selectedTier}
              onChange={(e) => setForm({ ...form, selectedTier: e.target.value })}
              className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--border-ink)]/25 bg-[var(--bg-canvas)] text-[var(--ink-primary)] focus:outline-none focus:border-[#B4B0F5]"
            >
              <option value="Starter Agent & Pilot Setup">
                Tier 1: Starter Agent &amp; Pilot Setup (7-Day Pilot)
              </option>
              <option value="14-Day Core System Sprint">
                Tier 2: 14-Day Core System Sprint (Most Popular)
              </option>
              <option value="Full Multi-System Architecture">
                Tier 3: Full Multi-System Architecture (21-Day Rollout)
              </option>
              <option value="Custom Architectural Scope">
                Custom Architectural Scope
              </option>
            </select>
          </div>

          {/* Project Brief */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-mono font-bold text-[var(--ink-secondary)] uppercase">
              Project Brief / Operational Bottleneck *
            </label>
            <textarea
              rows={4}
              value={form.projectBrief}
              onChange={(e) => setForm({ ...form, projectBrief: e.target.value })}
              placeholder="Describe your current phone support volume, WhatsApp sales workflow, or the custom 3D web application you want built..."
              className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--border-ink)]/25 bg-[var(--bg-canvas)] text-[var(--ink-primary)] focus:outline-none focus:border-[#B4B0F5]"
            />
            {formErrors.projectBrief && (
              <span className="text-xs text-rose-500 font-medium">
                {formErrors.projectBrief}
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Step 1 */}
        <div className="mt-8 pt-6 border-t border-[var(--border-ink)]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[var(--ink-secondary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero spam · Instant localized Rate Card PDF download</span>
          </div>

          <button
            onClick={handleStep1Proceed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#111111] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md group"
          >
            <span>Step 1: Generate Commercial Brochure &amp; Review Legal Terms</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* STEP 2 MODAL: The 6 Binding Commercial & Legal Clauses */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl border-2 border-[var(--border-ink)] bg-[var(--bg-surface)] p-6 sm:p-10 shadow-2xl flex flex-col text-[var(--ink-primary)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-ink)]/15">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#E2C870] text-[#111111]">
                  STEP 2 OF 2 · LEGAL CLEARANCE
                </span>
                <h3 className="mt-1 text-2xl font-black text-[var(--ink-primary)]">
                  The 6 Binding Commercial Clauses
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full border border-[var(--border-ink)]/20 hover:bg-[var(--bg-elevated)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notice */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#B4B0F5]/20 border border-[#B4B0F5] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8883d6]" />
                <span className="font-medium text-[var(--ink-primary)]">
                  {brochureDownloaded
                    ? `WebWink-2026-Commercial-Brochure-${region}.pdf generated & downloaded.`
                    : 'Brochure generation ready.'}
                </span>
              </div>
              <button
                onClick={() => {
                  const doc = generateBrochurePdf(region);
                  doc.save(`WebWink-2026-Commercial-Brochure-${region}.pdf`);
                  setBrochureDownloaded(true);
                }}
                className="inline-flex items-center gap-1 font-bold text-xs underline text-[var(--ink-primary)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Re-Download PDF</span>
              </button>
            </div>

            {/* Scrollable Clauses Container */}
            <div className="mt-4 overflow-y-auto space-y-4 pr-2 flex-1 max-h-[46vh]">
              {LEGAL_CLAUSES.map((clause) => (
                <div
                  key={clause.number}
                  className="rounded-2xl border border-[var(--border-ink)]/20 bg-[var(--bg-elevated)] p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[var(--ink-primary)]">
                      Clause {clause.number}: {clause.title}
                    </span>
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-ink)]/15 text-[var(--ink-secondary)]">
                      {clause.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ink-secondary)] leading-relaxed font-normal">
                    {clause.fullText}
                  </p>
                </div>
              ))}
            </div>

            {/* Error banner if any */}
            {serverError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Mandatory Checkbox & Dispatch */}
            <div className="mt-6 pt-4 border-t border-[var(--border-ink)]/15 space-y-4">
              <label
                onClick={() => setLegalClausesAccepted(!legalClausesAccepted)}
                className="flex items-start gap-3 cursor-pointer select-none group"
              >
                <div className="mt-0.5 text-[var(--ink-primary)]">
                  {legalClausesAccepted ? (
                    <CheckSquare className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Square className="w-5 h-5 text-[var(--ink-secondary)] group-hover:text-[var(--ink-primary)]" />
                  )}
                </div>
                <span className="text-xs font-semibold text-[var(--ink-primary)] leading-snug">
                  I confirm that I have received the WebWink 2026 Commercial Brochure and agree to the 6 Commercial &amp; Legal Clauses above.
                </span>
              </label>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[var(--border-ink)]/30 text-xs font-bold hover:bg-[var(--bg-elevated)]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleFinalDispatch}
                  disabled={!legalClausesAccepted || submitting}
                  className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold transition-all shadow-md ${
                    legalClausesAccepted && !submitting
                      ? 'bg-[#111111] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] hover:scale-105 active:scale-95'
                      : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'Dispatching Official Inquiry...'
                      : 'Step 2: Accept Terms & Dispatch Official Inquiry ↗'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Receipt Confirmation Modal */}
      {submissionReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-[var(--border-ink)] bg-[var(--bg-surface)] p-8 shadow-2xl text-[var(--ink-primary)] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-[var(--ink-primary)]">
              Official Inquiry Received
            </h3>

            <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
              Your inquiry has been submitted and locked under WebWink Protocol 2026 commercial terms.
            </p>

            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-ink)]/15 text-left space-y-2 text-xs font-mono">
              <div>
                <span className="text-[var(--ink-secondary)]">Receipt ID: </span>
                <strong className="text-[var(--ink-primary)]">{submissionReceipt.receiptId}</strong>
              </div>
              <div>
                <span className="text-[var(--ink-secondary)]">Cryptographic Consent Hash: </span>
                <span className="break-all text-[10px] text-[var(--ink-primary)]">
                  {submissionReceipt.acceptanceHash}
                </span>
              </div>
              <div>
                <span className="text-[var(--ink-secondary)]">Timestamp: </span>
                <span className="text-[10px] text-[var(--ink-primary)]">
                  {new Date(submissionReceipt.submittedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSubmissionReceipt(null)}
              className="mt-4 px-8 py-3 rounded-full bg-[#111111] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] text-xs font-bold hover:scale-105 active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
