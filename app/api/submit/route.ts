import { NextRequest, NextResponse } from 'next/server';
import type { SubmitPayload, SubmitResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  // Parse request body
  let body: SubmitPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  const { companies } = body;

  // Validation
  if (!Array.isArray(companies)) {
    return NextResponse.json(
      { error: 'companies must be an array' },
      { status: 400 }
    );
  }

  if (companies.length === 0) {
    return NextResponse.json(
      { error: 'At least one company is required' },
      { status: 400 }
    );
  }

  if (companies.length > 100) {
    return NextResponse.json(
      { error: `Maximum 100 companies per batch. You submitted ${companies.length}.` },
      { status: 400 }
    );
  }

  // Validate each company has a LinkedIn URL
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    if (!company.company_linkedin_url || typeof company.company_linkedin_url !== 'string') {
      return NextResponse.json(
        { error: `Company at index ${i} is missing company_linkedin_url` },
        { status: 400 }
      );
    }
    if (!company.company_linkedin_url.includes('linkedin.com/company/')) {
      return NextResponse.json(
        {
          error: `Company at index ${i} has an invalid LinkedIn URL: ${company.company_linkedin_url}`,
        },
        { status: 400 }
      );
    }
  }

  // Generate unique job ID
  const jobId = crypto.randomUUID();

  // Get n8n webhook URL
  const webhookUrl = process.env.N8N_WEBHOOK_ENRICH_URL;

  if (!webhookUrl) {
    // Dev fallback: return accepted with jobId even without n8n configured
    console.warn('[HelixGTM] N8N_WEBHOOK_ENRICH_URL not set — running in dev mode');
    const response: SubmitResponse = {
      jobId,
      status: 'accepted',
      message: 'Enrichment started successfully (dev mode)',
    };
    return NextResponse.json(response, { status: 202 });
  }

  // Send to n8n webhook
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const n8nRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HelixGTM/1.0',
      },
      body: JSON.stringify({
        jobId,
        companies,
        submittedAt: new Date().toISOString(),
        totalCompanies: companies.length,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!n8nRes.ok) {
      const errorText = await n8nRes.text().catch(() => 'Unknown error');
      console.error('[HelixGTM] n8n webhook error:', n8nRes.status, errorText);
      return NextResponse.json(
        {
          error: 'Enrichment service unavailable. Please try again.',
          details: `n8n responded with ${n8nRes.status}`,
        },
        { status: 502 }
      );
    }
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    console.error('[HelixGTM] Failed to reach n8n:', err);
    return NextResponse.json(
      {
        error: isTimeout
          ? 'Enrichment service timed out. Please try again.'
          : 'Failed to reach enrichment service. Please try again.',
      },
      { status: 502 }
    );
  }

  const response: SubmitResponse = {
    jobId,
    status: 'accepted',
    message: `Enrichment started for ${companies.length} ${companies.length === 1 ? 'company' : 'companies'}`,
  };

  return NextResponse.json(response, { status: 202 });
}
