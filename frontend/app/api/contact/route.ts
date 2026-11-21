import { NextResponse } from 'next/server';
import { InquiryIntake } from '@/lib/inquiry/InquiryIntake';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const result = await InquiryIntake.processLead(rawBody);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.issues },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
