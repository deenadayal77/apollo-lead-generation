import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { LeadReportDocument } from '@/components/pdf/LeadReport';
import type { Job } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

interface RouteParams {
  params: { jobId: string };
}

async function fetchJobStatus(jobId: string): Promise<Job | null> {
  const statusUrl = process.env.N8N_WEBHOOK_STATUS_URL;

  if (!statusUrl) {
    // Dev fallback
    const mockJob: Job = {
      jobId,
      status: 'complete',
      totalCompanies: 2,
      processedCount: 2,
      companies: [
        {
          company_linkedin_url: 'https://www.linkedin.com/company/acme',
          company_name: 'Acme Corp',
          status: 'found',
          person_name: 'Jane Smith',
          title: 'VP of Sales',
          seniority: 'VP',
          email: 'jane.smith@acme.com',
          phone: '+1 555-0100',
          location: 'San Francisco, CA',
          industry: 'Software',
          company_size: '51-200',
          enriched_at: new Date().toISOString(),
        },
        {
          company_linkedin_url: 'https://www.linkedin.com/company/techcorp',
          company_name: 'TechCorp',
          status: 'no_email',
          person_name: 'Bob Johnson',
          title: 'Head of Engineering',
          reason: 'Email not publicly available',
          enriched_at: new Date().toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 120000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockJob;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(
      `${statusUrl}?jobId=${encodeURIComponent(jobId)}`,
      {
        cache: 'no-store',
        headers: { 'User-Agent': 'HelixGTM/1.0', Accept: 'application/json' },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data: Job = await res.json();
    return data;
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { jobId } = params;

  if (!jobId || jobId.trim().length === 0) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  // Fetch job status
  const job = await fetchJobStatus(jobId);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.status !== 'complete') {
    return NextResponse.json(
      {
        error: `Job not complete yet. Current status: ${job.status}`,
        currentStatus: job.status,
      },
      { status: 400 }
    );
  }

  // Generate PDF
  try {
    const element = React.createElement(LeadReportDocument, { job });
    const buffer = await renderToBuffer(element);

    const filename = `helixgtm-leads-${jobId.slice(0, 8)}.pdf`;

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
    console.error('[HelixGTM] PDF generation error:', err);
    return NextResponse.json(
      { error: 'Failed to generate PDF. Please try again.' },
      { status: 500 }
    );
  }
}
