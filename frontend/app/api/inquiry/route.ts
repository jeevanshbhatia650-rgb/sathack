import { NextRequest, NextResponse } from 'next/server';
import { InquiryIntake } from '@/lib/inquiry/InquiryIntake';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const idempotencyKey = request.headers.get('x-idempotency-key');

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const result = await InquiryIntake.processInquiry(body, { ip, idempotencyKey });

  if (!result.success) {
    return NextResponse.json(
      {
        error: result.error,
        message: result.message,
        issues: result.issues,
        retryAfter: result.retryAfter,
      },
      {
        status: result.status,
        headers: result.retryAfter
          ? { 'Retry-After': String(result.retryAfter) }
          : undefined,
      }
    );
  }

  return NextResponse.json(result.data, { status: result.status });
}
