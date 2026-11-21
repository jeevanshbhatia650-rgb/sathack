import { google } from "googleapis";

export interface ContactLeadPayload {
  personName: string;
  contact: string;
  solutionRequired: string;
  customisationRequired?: string;
  budget: string;
  submittedAt: string;
  source?: string;
}

export interface MeetingBookingPayload {
  meetingId: string;
  clientName: string;
  contact: string;
  dateTime: string;
  serviceInterest: string;
  notes?: string;
  bookedAt: string;
  status?: string;
  source?: string;
}

function getGoogleSheetsClient() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetId || !clientEmail || !privateKey) {
    return null;
  }

  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  return { sheets, sheetId };
}

/**
 * Ensures a specific tab exists in the spreadsheet with initial headers.
 */
async function ensureTabWithHeaders(
  sheets: any,
  spreadsheetId: string,
  tabTitle: string,
  headers: string[]
) {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const existingTitles: string[] = (meta.data.sheets || []).map(
      (s: any) => s.properties?.title
    );

    if (!existingTitles.includes(tabTitle)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: tabTitle,
                  gridProperties: { rowCount: 1000, columnCount: headers.length + 5 },
                },
              },
            },
          ],
        },
      });

      // Insert headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${tabTitle}'!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [headers],
        },
      });
      console.log(`[GOOGLE SHEETS] Successfully created tab '${tabTitle}' with headers.`);
    }
  } catch (err: any) {
    console.warn(`[GOOGLE SHEETS] Tab check failed for '${tabTitle}':`, err.message);
  }
}

/**
 * Appends a verified lead row directly into the 'Leads' tab.
 */
export async function appendLeadToGoogleSheet(lead: ContactLeadPayload) {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.warn("[GOOGLE SHEETS CRM] Missing credentials in environment. Lead logged to console.");
    return { success: false, reason: "Credentials not configured in .env.local" };
  }

  const { sheets, sheetId } = client;
  const tabName = "Leads";
  const leadHeaders = [
    "Submitted At",
    "Client Name",
    "Contact (Phone/Email)",
    "Solution Required",
    "Budget Tier",
    "Customisation Scope",
    "Lead Source",
  ];

  await ensureTabWithHeaders(sheets, sheetId, tabName, leadHeaders);

  const rowValues = [
    lead.submittedAt,
    lead.personName,
    lead.contact,
    lead.solutionRequired,
    lead.budget,
    lead.customisationRequired || "Standard Scope",
    lead.source || "Agency Website",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `'${tabName}'!A:G`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [rowValues],
    },
  });

  console.log(`[GOOGLE SHEETS CRM] Appended lead for ${lead.personName} to '${tabName}' tab`);
  return { success: true };
}

/**
 * Appends a scheduled meeting row directly into the special 'Meetings' tab.
 */
export async function appendMeetingToGoogleSheet(meeting: MeetingBookingPayload) {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.warn("[GOOGLE SHEETS CRM] Missing credentials. Meeting logged to console.");
    return { success: false, reason: "Credentials not configured in .env.local" };
  }

  const { sheets, sheetId } = client;
  const tabName = "Meetings";
  const meetingHeaders = [
    "Meeting ID",
    "Booked Timestamp",
    "Client Name",
    "Contact (Email/Phone)",
    "Requested Date & Time",
    "Service Interest",
    "Meeting Notes / Scope",
    "Status",
    "Channel Source",
  ];

  await ensureTabWithHeaders(sheets, sheetId, tabName, meetingHeaders);

  const rowValues = [
    meeting.meetingId,
    meeting.bookedAt,
    meeting.clientName,
    meeting.contact,
    meeting.dateTime,
    meeting.serviceInterest,
    meeting.notes || "Initial Discovery Call",
    meeting.status || "Confirmed / Sprint Reserved",
    meeting.source || "Fix-A-Meet Webhook",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `'${tabName}'!A:I`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [rowValues],
    },
  });

  console.log(`[GOOGLE SHEETS CRM] Logged meeting ${meeting.meetingId} for ${meeting.clientName} to '${tabName}' tab`);
  return { success: true };
}
