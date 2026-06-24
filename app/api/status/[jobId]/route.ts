import { NextRequest, NextResponse } from 'next/server';
import type { Job } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { jobId: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { jobId } = params;

  if (!jobId || jobId.trim().length === 0) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  const statusUrl = process.env.N8N_WEBHOOK_STATUS_URL;

  if (!statusUrl) {
    // Dev fallback: return a mock job so the UI works without n8n
    const mockJob: Job = {
      jobId,
      status: 'running',
      totalCompanies: 5,
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
          seniority: 'Director',
          location: 'New York, NY',
          industry: 'Technology',
          company_size: '201-500',
          reason: 'Email not publicly available',
          enriched_at: new Date().toISOString(),
        },
        {
          company_linkedin_url: 'https://www.linkedin.com/company/startup-io',
          company_name: 'Startup IO',
          status: 'enriching',
        },
        {
          company_linkedin_url: 'https://www.linkedin.com/company/widgets-llc',
          company_name: 'Widgets LLC',
          status: 'pending',
        },
        {
          company_linkedin_url: 'https://www.linkedin.com/company/not-a-real-co',
          company_name: 'Not A Real Co',
          status: 'pending',
        },
      ],
      createdAt: new Date(Date.now() - 60000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockJob, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(
      `${statusUrl}?jobId=${encodeURIComponent(jobId)}`,
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'HelixHD/1.0',
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('[HelixHD] Status webhook error:', res.status, errorText);
      return NextResponse.json(
        { error: `Status service returned ${res.status}` },
        { status: 502 }
      );
    }

    const data: Job = await res.json();

    return NextResponse.json(data, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    console.error('[HelixHD] Status fetch error:', err);
    return NextResponse.json(
      {
        error: isTimeout
          ? 'Status service timed out'
          : 'Failed to fetch job status',
      },
      { status: 500 }
    );
  }
}
