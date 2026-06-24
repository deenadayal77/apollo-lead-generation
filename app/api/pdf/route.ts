import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { LeadReportDocument } from '@/components/pdf/LeadReport';
import type { LookupResult } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: LookupResult;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.people || !Array.isArray(body.people)) {
    return NextResponse.json({ error: 'people array is required' }, { status: 400 });
  }

  try {
    const element = React.createElement(LeadReportDocument, { result: body });
    const buffer = await renderToBuffer(element);

    const companySlug = (body.company_url || 'company')
      .replace(/https?:\/\//, '')
      .replace(/www\.linkedin\.com\/company\//, '')
      .replace(/\//g, '')
      .slice(0, 30);
    const filename = `helixgtm-${companySlug}-leads.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[HelixGTM] PDF error:', err);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
