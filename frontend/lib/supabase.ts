import { createClient } from "@supabase/supabase-js";

export interface SupabaseLeadPayload {
  person_name: string;
  contact: string;
  solution_required: string;
  customisation_required?: string;
  budget: string;
  submitted_at?: string;
  source?: string;
}

export interface SupabaseMeetingPayload {
  meeting_ref: string;
  client_name: string;
  contact: string;
  date_time: string;
  service_interest: string;
  notes?: string;
  booked_at?: string;
  status?: string;
  source?: string;
}

export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Inserts an inbound lead directly into the Supabase 'leads' table.
 */
export async function insertLeadToSupabase(lead: SupabaseLeadPayload) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.warn("[SUPABASE CRM] Missing SUPABASE_URL or SUPABASE_KEY. Lead logged to memory.");
    return {
      success: false,
      reason: "Supabase credentials not configured in environment.",
    };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert([
      {
        person_name: lead.person_name,
        contact: lead.contact,
        solution_required: lead.solution_required,
        customisation_required: lead.customisation_required || "Standard Scope",
        budget: lead.budget,
        submitted_at: lead.submitted_at || new Date().toISOString(),
        source: lead.source || "Agency Website",
      },
    ])
    .select();

  if (error) {
    console.error("[SUPABASE ERROR inserting lead]:", error.message);
    throw new Error(error.message);
  }

  console.log(`[SUPABASE CRM] Successfully recorded lead for ${lead.person_name}`);
  return { success: true, data };
}

/**
 * Inserts a scheduled consultation directly into the Supabase 'meetings' table.
 */
export async function insertMeetingToSupabase(meeting: SupabaseMeetingPayload) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.warn("[SUPABASE CRM] Missing SUPABASE_URL or SUPABASE_KEY. Meeting logged to memory.");
    return {
      success: false,
      reason: "Supabase credentials not configured in environment.",
    };
  }

  const { data, error } = await supabase
    .from("meetings")
    .insert([
      {
        meeting_ref: meeting.meeting_ref,
        client_name: meeting.client_name,
        contact: meeting.contact,
        date_time: meeting.date_time,
        service_interest: meeting.service_interest,
        notes: meeting.notes || "Initial Discovery Sprint",
        booked_at: meeting.booked_at || new Date().toISOString(),
        status: meeting.status || "Confirmed / Sprint Reserved",
        source: meeting.source || "Fix-A-Meet Webhook",
      },
    ])
    .select();

  if (error) {
    console.error("[SUPABASE ERROR inserting meeting]:", error.message);
    throw new Error(error.message);
  }

  console.log(`[SUPABASE CRM] Successfully booked meeting ${meeting.meeting_ref} for ${meeting.client_name}`);
  return { success: true, data };
}

