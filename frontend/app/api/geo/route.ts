import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country-code') ||
    '';

  const isIndia = country.toUpperCase() === 'IN';

  return NextResponse.json({
    country: country || (isIndia ? 'IN' : 'UNKNOWN'),
    region: isIndia ? 'IN' : 'GLOBAL',
  });
}
