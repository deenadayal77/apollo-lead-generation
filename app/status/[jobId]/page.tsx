import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Job } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatusDashboard from '@/components/StatusDashboard';

interface PageProps {
  params: { jobId: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: `Job ${params.jobId.slice(0, 8)}... — HelixGTM`,
    description: 'Track your lead enrichment job status in real time.',
  };
}

async function getInitialJob(jobId: string): Promise<Job | null> {
  const statusUrl = process.env.N8N_WEBHOOK_STATUS_URL;

  if (!statusUrl) {
    // Return a mock pending job for development when env var is not set
    return {
      jobId,
      status: 'pending',
      totalCompanies: 0,
      processedCount: 0,
      companies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${statusUrl}?jobId=${encodeURIComponent(jobId)}`, {
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) return null;
      return null;
    }

    const data = await res.json();
    return data as Job;
  } catch {
    return null;
  }
}

export default async function StatusPage({ params }: PageProps) {
  const { jobId } = params;

  // Basic validation
  if (!jobId || jobId.length < 4) {
    notFound();
  }

  const initialJob = await getInitialJob(jobId);

  if (!initialJob) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <a href="/" className="hover:text-slate-300 transition-colors">
              Home
            </a>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-slate-400">Enrichment Status</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
            Enrichment Status
          </h1>
          <p className="text-slate-400 text-sm">
            Track your lead enrichment progress in real time. Results update automatically every 3
            seconds.
          </p>
        </div>

        {/* Dashboard */}
        <StatusDashboard job={initialJob} jobId={jobId} />
      </main>

      <Footer />
    </div>
  );
}
