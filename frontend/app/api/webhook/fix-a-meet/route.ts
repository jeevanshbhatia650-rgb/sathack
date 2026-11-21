import { NextResponse } from 'next/server';
import { InquiryIntake } from '@/lib/inquiry/InquiryIntake';

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const result = await InquiryIntake.processMeeting(raw);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.issues },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal webhook error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    webhook: 'Fix A Meet Webhook',
    status: 'Active',
    endpoint: '/api/webhook/fix-a-meet',
    targetDatabase: "Supabase PostgreSQL ('meetings' table)",
    supportedPayloadFormat: {
      clientName: 'John Doe (string, required)',
      contact: 'john@example.com / +1-555-0199 (string, required)',
      dateTime: '2026-11-20 10:00 AM PST (string, required)',
      serviceInterest: '01. Live Business Dashboards (string, optional)',
      notes: 'Sprint requirements (string, optional)',
    },
  });
}
