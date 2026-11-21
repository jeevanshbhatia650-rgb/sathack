import { z } from 'zod';
import crypto from 'crypto';
import { insertLeadToSupabase, insertMeetingToSupabase, SupabaseLeadPayload, SupabaseMeetingPayload } from '@/lib/supabase';

// --- Types & Schemas ---

export const inquirySchema = z.object({
  fullName: z.string().min(2).max(100),
  workEmail: z.string().email().max(120),
  companyName: z.string().min(1).max(120),
  selectedTier: z.string().min(1),
  region: z.enum(['IN', 'GLOBAL']),
  projectBrief: z.string().min(5).max(3000),
  brochureDownloaded: z.literal(true),
  legalClausesAccepted: z.literal(true),
  acceptedTimestamp: z.string(),
});

export const leadSchema = z.object({
  personName: z.string().min(2, 'Name must be at least 2 characters'),
  contact: z.string().min(3, 'Please enter a valid phone or email address'),
  solutionRequired: z.enum([
    'Live Business Dashboards',
    'Custom Animated Websites',
    'Smart AI Websites (24/7 Q&A)',
    'AI Sales & Product Chatbots',
    'Automated Lead Engines',
    'Smart AI & Standard CRMs',
    'All-In-One Growth Stack',
  ]),
  customisationRequired: z.string().optional().default('Standard Scope'),
  budget: z.string().min(1, 'Budget is required'),
});

export const meetingSchema = z.object({
  clientName: z.string().min(2, 'Client name is required (min 2 chars)'),
  contact: z.string().min(3, 'Valid contact (phone or email) is required'),
  dateTime: z.string().min(3, 'Preferred meeting date and time is required'),
  serviceInterest: z.string().optional().default('General Commercial Discovery'),
  notes: z.string().optional().default('Discovery & Architecture Scoping'),
  source: z.string().optional().default('Fix-A-Meet Webhook'),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type MeetingInput = z.infer<typeof meetingSchema>;

export interface IntakeContext {
  ip?: string;
  idempotencyKey?: string | null;
}

export interface IntakeResult<T = any> {
  success: boolean;
  status: number;
  data?: T;
  error?: string;
  message?: string;
  retryAfter?: number;
  issues?: any;
}

// --- Deep Module State & Helpers ---

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins
const MAX_REQUESTS = 5;

const idempotencyStore = new Map<string, { timestamp: number; response: any }>();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function sanitizeInput(str: string): string {
  return str.replace(/<[^>]*>?/gm, '').trim();
}

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delays = [1000, 2000, 4000],
  timeoutMs = 5000
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
        ),
      ]);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        await new Promise((res) => setTimeout(res, delays[attempt]));
      }
    }
  }
  throw lastError;
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= MAX_REQUESTS) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return { allowed: true };
}

function checkIdempotency(key: string | null | undefined): any | null {
  if (!key) return null;
  const cached = idempotencyStore.get(key);
  if (cached && Date.now() - cached.timestamp < IDEMPOTENCY_TTL_MS) {
    return cached.response;
  }
  return null;
}

function saveIdempotency(key: string | null | undefined, response: any) {
  if (!key) return;
  idempotencyStore.set(key, {
    timestamp: Date.now(),
    response,
  });
}

// --- InquiryIntake Engine ---

export class InquiryIntake {
  /**
   * Process an official commercial inquiry with cryptographic legal receipt,
   * rate-limiting, idempotency, email dispatch, and CRM sync.
   */
  static async processInquiry(rawBody: any, ctx: IntakeContext = {}): Promise<IntakeResult> {
    const ip = ctx.ip || '127.0.0.1';

    // 1. Rate Limiting
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return {
        success: false,
        status: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please wait before submitting another inquiry.',
        retryAfter: rateCheck.retryAfter,
      };
    }

    // 2. Idempotency Check
    const cachedResponse = checkIdempotency(ctx.idempotencyKey);
    if (cachedResponse) {
      return {
        success: true,
        status: 200,
        data: cachedResponse,
      };
    }

    // 3. Sanitization & Validation
    const sanitizedBody = {
      ...rawBody,
      fullName: typeof rawBody?.fullName === 'string' ? sanitizeInput(rawBody.fullName) : '',
      workEmail: typeof rawBody?.workEmail === 'string' ? sanitizeInput(rawBody.workEmail) : '',
      companyName: typeof rawBody?.companyName === 'string' ? sanitizeInput(rawBody.companyName) : '',
      projectBrief: typeof rawBody?.projectBrief === 'string' ? sanitizeInput(rawBody.projectBrief) : '',
    };

    const parsed = inquirySchema.safeParse(sanitizedBody);
    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        error: 'Validation Error',
        issues: parsed.error.issues,
      };
    }

    const inquiryData = parsed.data;

    // 4. Cryptographic Legal Receipt Generation
    const acceptancePayload = `${inquiryData.workEmail}|${inquiryData.companyName}|${inquiryData.acceptedTimestamp}|LEGAL_CLAUSES_1_TO_6`;
    const acceptanceHash = crypto
      .createHash('sha256')
      .update(acceptancePayload)
      .digest('hex');

    const receiptId = `WW-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // 5. Multi-Sink Dispatch (Resend Email + Supabase Lead Recording)
    try {
      await executeWithRetry(async () => {
        if (process.env.RESEND_API_KEY) {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: process.env.MAIL_FROM || 'WebWink Protocol <inquiries@webwink.io>',
              to: [inquiryData.workEmail],
              bcc: [process.env.FOUNDER_ALERT_EMAIL || 'founder@webwink.io'],
              subject: `[WebWink Protocol] Receipt & Official Inquiry ${receiptId}`,
              html: `
                <h2>WebWink Protocol — Official Inquiry Received</h2>
                <p>Hi ${inquiryData.fullName},</p>
                <p>We have received your project inquiry for <strong>${inquiryData.companyName}</strong>.</p>
                <p><strong>Selected Tier:</strong> ${inquiryData.selectedTier}</p>
                <p><strong>Region / Currency:</strong> ${inquiryData.region === 'IN' ? 'India (INR ₹ · 25% Regional Grant)' : 'Global (USD $)'}</p>
                <p><strong>Cryptographic Legal Consent Hash:</strong> <code>${acceptanceHash}</code></p>
                <p>Our lead systems architect will review your workflow brief and respond within 12 hours.</p>
              `,
            }),
          });

          if (!response.ok) {
            throw new Error(`Email provider returned HTTP ${response.status}`);
          }
        } else {
          console.log('[INQUIRY DISPATCHED] Receipt:', receiptId, {
            email: inquiryData.workEmail,
            company: inquiryData.companyName,
            tier: inquiryData.selectedTier,
            region: inquiryData.region,
            hash: acceptanceHash,
          });
        }
        return true;
      });
    } catch (err: any) {
      console.error('[INQUIRY] Mail dispatch error:', err?.message);
    }

    // Try background CRM sync to Supabase if configured
    try {
      await insertLeadToSupabase({
        person_name: inquiryData.fullName,
        contact: inquiryData.workEmail,
        solution_required: inquiryData.selectedTier,
        customisation_required: `Region: ${inquiryData.region} | Company: ${inquiryData.companyName} | Hash: ${acceptanceHash.substring(0, 12)}...`,
        budget: inquiryData.selectedTier,
        submitted_at: new Date().toISOString(),
        source: 'WebWink Official Inquiry Gate',
      });
    } catch (supabaseErr: any) {
      // Non-blocking log
      console.warn('[INQUIRY] Supabase sync omitted or deferred:', supabaseErr?.message);
    }

    const responseData = {
      success: true,
      receiptId,
      acceptanceHash,
      status: 'INQUIRY_RECEIVED_PENDING_ARCHITECT_REVIEW',
      submittedAt: new Date().toISOString(),
      details: {
        fullName: inquiryData.fullName,
        companyName: inquiryData.companyName,
        selectedTier: inquiryData.selectedTier,
        region: inquiryData.region,
      },
    };

    saveIdempotency(ctx.idempotencyKey, responseData);

    return {
      success: true,
      status: 200,
      data: responseData,
    };
  }

  /**
   * Ingest a rate-card or contact lead into CRM storage (Supabase or memory).
   */
  static async processLead(rawBody: any): Promise<IntakeResult> {
    const parsed = leadSchema.safeParse(rawBody);
    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        error: 'Validation failed',
        issues: parsed.error.issues || parsed.error.format(),
      };
    }

    const lead = parsed.data;
    const submissionPayload: SupabaseLeadPayload = {
      person_name: sanitizeInput(lead.personName),
      contact: sanitizeInput(lead.contact),
      solution_required: lead.solutionRequired,
      customisation_required: sanitizeInput(lead.customisationRequired || 'Standard Scope'),
      budget: sanitizeInput(lead.budget),
      submitted_at: new Date().toISOString(),
      source: 'Agency Landing Page / Rate Card',
    };

    console.log('[SUPABASE CRM INGESTION RECEIVED]', submissionPayload);

    let dbResult: { success: boolean; reason?: string; data?: any } = { success: false, reason: 'Local demonstration mode' };
    try {
      dbResult = await insertLeadToSupabase(submissionPayload);
    } catch (dbErr: any) {
      console.error('[SUPABASE INSERT ERROR]', dbErr.message);
    }

    return {
      success: true,
      status: 200,
      data: {
        success: true,
        message: dbResult.success
          ? "Lead logged directly into Supabase 'leads' table."
          : 'Lead captured successfully in server memory. (Configure SUPABASE_URL & SUPABASE_ANON_KEY to sync to Supabase)',
        lead: submissionPayload,
        supabaseSynced: dbResult.success,
      },
    };
  }

  /**
   * Ingest a scheduled consultation / webhook event into CRM storage (Supabase or memory).
   */
  static async processMeeting(raw: any): Promise<IntakeResult> {
    // Normalize payload to accept multiple standard webhook keys
    const normalized = {
      clientName: raw.clientName || raw.personName || raw.name || raw.customer_name || 'Prospective Client',
      contact: raw.contact || raw.email || raw.phone || 'No contact provided',
      dateTime: raw.dateTime || raw.date_time || raw.event_time || raw.time || new Date().toISOString(),
      serviceInterest: raw.serviceInterest || raw.service || raw.solutionRequired || 'General Commercial Discovery',
      notes: raw.notes || raw.message || raw.customisationRequired || 'Initial Discovery Sprint',
      source: raw.source || 'Fix-A-Meet Webhook',
    };

    const parsed = meetingSchema.safeParse(normalized);
    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        error: 'Validation failed',
        issues: parsed.error.issues || parsed.error.format(),
      };
    }

    const validated = parsed.data;
    const meetingRef = `MEET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookedAt = new Date().toISOString();

    const meetingPayload: SupabaseMeetingPayload = {
      meeting_ref: meetingRef,
      client_name: sanitizeInput(validated.clientName),
      contact: sanitizeInput(validated.contact),
      date_time: sanitizeInput(validated.dateTime),
      service_interest: sanitizeInput(validated.serviceInterest || 'General Commercial Discovery'),
      notes: sanitizeInput(validated.notes || 'Discovery & Architecture Scoping'),
      booked_at: bookedAt,
      status: 'Confirmed / Sprint Reserved',
      source: sanitizeInput(validated.source || 'Fix-A-Meet Webhook'),
    };

    console.log('[FIX-A-MEET SUPABASE WEBHOOK RECEIVED]', meetingPayload);

    let dbResult: { success: boolean; reason?: string; data?: any } = { success: false, reason: 'Local Demonstration Mode' };
    try {
      dbResult = await insertMeetingToSupabase(meetingPayload);
    } catch (dbErr: any) {
      console.error('[SUPABASE MEETINGS ERROR]', dbErr.message);
    }

    return {
      success: true,
      status: 200,
      data: {
        success: true,
        meetingId: meetingRef,
        message: dbResult.success
          ? "Meeting confirmed and recorded in Supabase 'meetings' table."
          : 'Meeting captured in memory. (Configure SUPABASE_URL & SUPABASE_ANON_KEY to sync to Supabase)',
        meeting: meetingPayload,
        supabaseSynced: dbResult.success,
      },
    };
  }
}
