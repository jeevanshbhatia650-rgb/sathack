'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface ContactContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTier?: string;
}

interface FormData {
  fullName: string;
  workEmail: string;
  companyName: string;
  selectedTier: string;
  projectBrief: string;
}

export const ContactContractModal: React.FC<ContactContractModalProps> = ({
  isOpen,
  onClose,
  initialTier = '14-Day Core System Sprint',
}) => {
  const { region, isIndia } = useGeoPricing();

  const [step, setStep] = useState<1 | 2>(1);
  const [brochureDownloaded, setBrochureDownloaded] = useState(false);
  const [legalClausesAccepted, setLegalClausesAccepted] = useState(false);

  const [form, setForm] = useState<FormData>({
    fullName: '',
    workEmail: '',
    companyName: '',
    selectedTier: initialTier,
    projectBrief: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    receiptId: string;
    acceptanceHash: string;
    submittedAt: string;
  } | null>(null);

  // Sync initial tier if changed
  useEffect(() => {
    if (initialTier) {
      setForm((prev) => ({ ...prev, selectedTier: initialTier }));
    }
  }, [initialTier]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setReceipt(null);
      setServerError(null);
      setFormErrors({});
    }
  }, [isOpen]);

  const handleDownloadPdf = () => {
    try {
      const doc = generateBrochurePdf(region);
      doc.save(`WebWink-2026-Commercial-Brochure-${region}.pdf`);
      setBrochureDownloaded(true);
    } catch (e) {
      console.error('Failed to generate brochure PDF:', e);
    }
  };

  const handleStep1Proceed = () => {
    if (!legalClausesAccepted) return;
    if (!brochureDownloaded) {
      handleDownloadPdf();
    }
    setStep(2);
  };

  const validateStep2 = (): boolean => {
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

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

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
        throw new Error(data.message || data.error || 'Failed to dispatch official inquiry');
      }

      setReceipt({
        receiptId: data.receiptId,
        acceptanceHash: data.acceptanceHash,
        submittedAt: data.submittedAt,
      });
    } catch (err: any) {
      setServerError(err.message || 'Submission error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl my-auto rounded-3xl border-2 border-[var(--border-ink)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-2xl text-[var(--ink-primary)] z-10 flex flex-col max-h-[92vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-ink)]/15 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#E2C870]/20 border border-[#E2C870] flex items-center justify-center text-[#111111] dark:text-[#FAF9F5]">
                  <Lock className="w-4 h-4 text-[#c7a73f]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#E2C870] text-[#111111]">
                      {step === 1 ? 'Step 1 of 2: Commercial Agreement' : 'Step 2 of 2: Project Inquiry'}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--ink-secondary)]">
                      {isIndia ? 'INR ₹ Localized' : 'Global USD $'}
                    </span>
                  </div>
                  <h3 className="mt-0.5 text-xl sm:text-2xl font-black text-[var(--ink-primary)] tracking-tight">
                    {step === 1 ? 'Commercial Contract & Legal Review' : 'Initiate Official Inquiry'}
                  </h3>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                onClick={onClose}
                className="p-2 rounded-full border border-[var(--border-ink)]/20 hover:bg-[var(--bg-elevated)] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-[var(--ink-primary)]" />
              </motion.button>
            </div>

            {/* Scrollable Body Content */}
            <div className="overflow-y-auto flex-1 my-4 pr-1 sm:pr-2">
              <AnimatePresence mode="wait">
                {receipt ? (
                  /* Step 3: Success Confirmation Screen */
                  <motion.div
                    key="receipt"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="py-6 text-center space-y-5"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-2xl font-black text-[var(--ink-primary)]">
                        Inquiry Received &amp; Cryptographically Locked
                      </h4>
                      <p className="text-xs sm:text-sm text-[var(--ink-secondary)] max-w-md mx-auto">
                        Your project brief has been logged under WebWink Protocol 2026 Commercial terms. An engineering lead will review within 24 hours.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-ink)]/20 text-left space-y-2.5 text-xs font-mono max-w-lg mx-auto shadow-inner">
                      <div className="flex justify-between items-center py-1 border-b border-[var(--border-ink)]/10">
                        <span className="text-[var(--ink-secondary)]">Receipt ID:</span>
                        <strong className="text-[var(--ink-primary)]">{receipt.receiptId}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-[var(--border-ink)]/10">
                        <span className="text-[var(--ink-secondary)]">Selected Sprint Tier:</span>
                        <strong className="text-[var(--ink-primary)]">{form.selectedTier}</strong>
                      </div>
                      <div className="py-1">
                        <span className="text-[var(--ink-secondary)] block mb-1">Cryptographic Consent Hash:</span>
                        <code className="text-[10px] break-all bg-[var(--bg-canvas)] p-2 rounded block border border-[var(--border-ink)]/15 text-[var(--ink-primary)]">
                          {receipt.acceptanceHash}
                        </code>
                      </div>
                      <div className="flex justify-between items-center pt-1 text-[10px] text-[var(--ink-secondary)]">
                        <span>Timestamp:</span>
                        <span>{new Date(receipt.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={onClose}
                      className="px-8 py-3.5 rounded-full bg-[#18181B] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] text-xs font-bold shadow-md"
                    >
                      Done &amp; Close Window
                    </motion.button>
                  </motion.div>
                ) : step === 1 ? (
                  /* STEP 1: Commercial Contract & Brochure Review */
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Instant Brochure Download Strip */}
                    <div className="p-4 rounded-2xl bg-[#B4B0F5]/20 border border-[#B4B0F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-[#8883d6] shrink-0" />
                        <div>
                          <span className="font-bold text-[var(--ink-primary)] block">
                            2026 Commercial Brochure ({isIndia ? '₹ INR Edition · 25% Off' : '$ USD Global Edition'})
                          </span>
                          <span className="text-[11px] text-[var(--ink-secondary)]">
                            Auto-matched to your region: {region} ({isIndia ? '₹37,500 – ₹2,25,000' : '$600 – $3,600'})
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#111111] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] font-bold text-xs shrink-0 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{brochureDownloaded ? 'Re-Download PDF' : 'Download Brochure PDF'}</span>
                      </motion.button>
                    </div>

                    {/* Legal Clauses Accordion / Cards List */}
                    <div className="space-y-3 max-h-[38vh] overflow-y-auto pr-1">
                      {LEGAL_CLAUSES.map((clause) => (
                        <div
                          key={clause.number}
                          className="rounded-2xl border border-[var(--border-ink)]/15 bg-[var(--bg-elevated)] p-3.5 sm:p-4 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-[var(--ink-primary)]">
                              Clause {clause.number}: {clause.title}
                            </span>
                            <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-ink)]/15 text-[var(--ink-secondary)] shrink-0">
                              {clause.badge}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--ink-secondary)] leading-relaxed font-normal">
                            {clause.fullText}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Mandatory Agreement Checkbox */}
                    <div className="pt-3 border-t border-[var(--border-ink)]/15">
                      <label
                        onClick={() => setLegalClausesAccepted(!legalClausesAccepted)}
                        className="flex items-start gap-3 cursor-pointer select-none group p-3 rounded-2xl hover:bg-[var(--bg-elevated)] transition-colors"
                      >
                        <div className="mt-0.5 text-[var(--ink-primary)] shrink-0">
                          {legalClausesAccepted ? (
                            <CheckSquare className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Square className="w-5 h-5 text-[var(--ink-secondary)] group-hover:text-[var(--ink-primary)]" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-[var(--ink-primary)] leading-snug">
                          I confirm that I have reviewed the WebWink 2026 Commercial Brochure and agree to the 6 Commercial &amp; Legal Clauses above.
                        </span>
                      </label>
                    </div>
                  </motion.div>
                ) : (
                  /* STEP 2: Project Inquiry Form */
                  <motion.form
                    key="step-2"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleFinalSubmit}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-[var(--ink-secondary)] uppercase">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          placeholder="e.g. Alex Rivera"
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-ink)]/25 bg-[var(--bg-canvas)] text-[var(--ink-primary)] focus:outline-none focus:border-[#B4B0F5]"
                        />
                        {formErrors.fullName && (
                          <span className="text-xs text-rose-500 font-medium">
                            {formErrors.fullName}
                          </span>
                        )}
                      </div>

                      {/* Work Email */}
                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-[var(--ink-secondary)] uppercase">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          value={form.workEmail}
                          onChange={(e) => setForm({ ...form, workEmail: e.target.value })}
                          placeholder="alex@company.com"
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-ink)]/25 bg-[var(--bg-canvas)] text-[var(--ink-primary)] focus:outline-none focus:border-[#B4B0F5]"
                        />
                        {formErrors.workEmail && (
                          <span className="text-xs text-rose-500 font-medium">
                            {formErrors.workEmail}
                          </span>
                        )}
                      </div>

                      {/* Company Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-[var(--ink-secondary)] uppercase">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={form.companyName}
                          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                          placeholder="Acme Corp / Studio X"
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-ink)]/25 bg-[var(--bg-canvas)] text-[var(--ink-primary)] focus:outline-none focus:border-[#B4B0F5]"
                        />
                        {formErrors.companyName && (
                          <span className="text-xs text-rose-500 font-medium">
                            {formErrors.companyName}
                          </span>
                        )}
                      </div>

                      {/* Target Sprint Tier */}
                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-[var(--ink-secondary)] uppercase">
                          Selected Sprint Tier
                        </label>
                        <select
                          value={form.selectedTier}
                          onChange={(e) => setForm({ ...form, selectedTier: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-ink)]/25 bg-[var(--bg-canvas)] text-[var(--ink-primary)] focus:outline-none focus:border-[#B4B0F5]"
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
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-mono font-bold text-[var(--ink-secondary)] uppercase">
                          Project Brief / Current Operational Bottlenecks *
                        </label>
                        <textarea
                          rows={3}
                          value={form.projectBrief}
                          onChange={(e) => setForm({ ...form, projectBrief: e.target.value })}
                          placeholder="Describe your current phone support volume, WhatsApp sales workflow, or the custom 3D web application you want built..."
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-ink)]/25 bg-[var(--bg-canvas)] text-[var(--ink-primary)] focus:outline-none focus:border-[#B4B0F5]"
                        />
                        {formErrors.projectBrief && (
                          <span className="text-xs text-rose-500 font-medium">
                            {formErrors.projectBrief}
                          </span>
                        )}
                      </div>
                    </div>

                    {serverError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500 text-rose-600 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{serverError}</span>
                      </div>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Modal Footer Controls */}
            {!receipt && (
              <div className="pt-4 border-t border-[var(--border-ink)]/15 flex items-center justify-between gap-3 shrink-0">
                {step === 2 ? (
                  <motion.button
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[var(--border-ink)]/30 text-xs font-bold hover:bg-[var(--bg-elevated)]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Clauses</span>
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2 text-[11px] text-[var(--ink-secondary)]">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Zero spam · Encrypted transmission</span>
                  </div>
                )}

                <div className="flex items-center gap-3 ml-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-full border border-[var(--border-ink)]/30 text-xs font-bold hover:bg-[var(--bg-elevated)]"
                  >
                    Cancel
                  </motion.button>

                  {step === 1 ? (
                    <motion.button
                      whileHover={legalClausesAccepted ? { y: -1.5, scale: 1.02 } : {}}
                      whileTap={legalClausesAccepted ? { y: 2.5, scale: 0.98 } : {}}
                      type="button"
                      disabled={!legalClausesAccepted}
                      onClick={handleStep1Proceed}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold border-[1.5px] border-[#111111] transition-all shadow-[0_3.5px_0_#111111] ${
                        legalClausesAccepted
                          ? 'bg-[#18181B] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] cursor-pointer'
                          : 'bg-zinc-300 text-zinc-500 border-zinc-400 shadow-none cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span>Sign &amp; Proceed to Project Inquiry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={!submitting ? { y: -1.5, scale: 1.02 } : {}}
                      whileTap={!submitting ? { y: 2.5, scale: 0.98 } : {}}
                      type="button"
                      disabled={submitting}
                      onClick={handleFinalSubmit}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold border-[1.5px] border-[#111111] transition-all shadow-[0_3.5px_0_#52525B] ${
                        !submitting
                          ? 'bg-[#18181B] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] cursor-pointer'
                          : 'bg-zinc-300 text-zinc-500 cursor-wait'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Dispatching Inquiry...' : 'Submit Official Inquiry ↗'}</span>
                    </motion.button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
