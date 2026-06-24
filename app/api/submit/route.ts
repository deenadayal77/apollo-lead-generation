import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MOCK_RESULT = {
  success: true,
  total: 3,
  people: [
    {
      name: 'Jane Smith',
      title: 'Chief Executive Officer',
      seniority: 'c_suite',
      email: 'jane.smith@example.com',
      linkedin_url: 'https://linkedin.com/in/jane-smith',
      location: 'San Francisco, CA, United States',
      phone: '+1 555-0100',
    },
    {
      name: 'Bob Johnson',
      title: 'VP of Sales',
      seniority: 'vp',
      email: 'bob.j@example.com',
      linkedin_url: 'https://linkedin.com/in/bob-johnson',
      location: 'New York, NY, United States',
      phone: '',
    },
    {
      name: 'Alice Lee',
      title: 'Director of Marketing',
      seniority: 'director',
      email: '',
      linkedin_url: '',
      location: 'Austin, TX, United States',
      phone: '',
    },
  ],
};

export async function POST(req: NextRequest) {
  let body: { company_url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const company_url = (body.company_url || '').trim();

  if (!company_url) {
    return NextResponse.json({ error: 'company_url is required' }, { status: 400 });
  }

  if (!company_url.includes('linkedin.com/company/')) {
    return NextResponse.json(
      { error: 'Must be a LinkedIn company URL (linkedin.com/company/...)' },
      { status: 400 }
    );
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    await new Promise((r) => setTimeout(r, 1500));
    return NextResponse.json({ ...MOCK_RESULT, company_url });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 58000);

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'HelixHD/1.0' },
      body: JSON.stringify({ company_url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as Record<string, string>;
      return NextResponse.json(
        { error: err.error || 'Lookup failed' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ ...data, company_url });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: 'Lookup timed out. Please try again.' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Could not reach enrichment service.' }, { status: 502 });
  }
}
