import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint is no longer available. Use POST /api/pdf instead.' },
    { status: 410 }
  );
}
