'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import clsx from 'clsx';
import type { Job } from '@/lib/types';
import ProgressBar from './ProgressBar';
import StatsCards from './StatsCards';
import CompanyTable from './CompanyTable';

interface StatusDashboardProps {
  job: Job;
  jobId: string;
}

export default function StatusDashboard({ job: initialJob, jobId }: StatusDashboardProps) {
  const [job, setJob] = useState<Job>(initialJob);
  const [copied, setCopied] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isTerminal = job.status === 'complete' || job.status === 'failed';

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/status/${jobId}`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Status check failed (${res.status})`);
      }
      const data: Job = await res.json();
      setJob(data);
      setPollError(null);

      // Stop polling if terminal
      if (data.status === 'complete' || data.status === 'failed') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      setPollError(err instanceof Error ? err.message : 'Failed to fetch status');
    }
  }, [jobId]);

  useEffect(() => {
    // Start polling only if not already in terminal state
    if (!isTerminal) {
      intervalRef.current = setInterval(fetchStatus, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStatus, isTerminal]);

  const handleCopyJobId = async () => {
    try {
      await navigator.clipboard.writeText(jobId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = jobId;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Job ID + status header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
              Job ID
            </p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-slate-300 font-mono bg-slate-800 px-3 py-1 rounded-lg break-all">
                {jobId}
              </code>
              <button
                onClick={handleCopyJobId}
                aria-label="Copy job ID to clipboard"
                className={clsx(
                  'flex-shrink-0 p-1.5 rounded-lg transition-all duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  copied
                    ? 'text-green-400 bg-green-950'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                )}
              >
                {copied ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-refresh indicator */}
            {!isTerminal && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
                Auto-refreshing every 3s
              </span>
            )}

            {/* Download PDF button — only when complete */}
            {job.status === 'complete' && (
              <a
                href={`/api/pdf/${jobId}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download enrichment report as PDF"
                className={clsx(
                  'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150',
                  'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700',
                  'shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900'
                )}
              >
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF Report
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Poll error */}
      {pollError && (
        <div
          className="flex items-center gap-3 bg-yellow-950 border border-yellow-800 rounded-xl px-4 py-3"
          role="alert"
          aria-live="polite"
        >
          <svg
            className="w-4 h-4 text-yellow-400 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-yellow-300">{pollError} — retrying automatically</p>
        </div>
      )}

      {/* Failed state */}
      {job.status === 'failed' && (
        <div
          className="flex items-start gap-3 bg-red-950 border border-red-800 rounded-xl px-5 py-4"
          role="alert"
        >
          <svg
            className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-300">Enrichment Failed</p>
            <p className="text-sm text-red-400 mt-0.5">
              The enrichment job encountered an error. Please try submitting your URLs again.
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <ProgressBar
        processedCount={job.processedCount}
        totalCompanies={job.totalCompanies}
        status={job.status}
      />

      {/* Stats cards */}
      <StatsCards companies={job.companies} />

      {/* Company table */}
      <CompanyTable companies={job.companies} />

      {/* Bottom download button — shown again for easy access when complete */}
      {job.status === 'complete' && (
        <div className="flex justify-center pt-2 pb-4">
          <a
            href={`/api/pdf/${jobId}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download enrichment report as PDF (bottom)"
            className={clsx(
              'inline-flex items-center gap-3 px-8 py-4 text-base font-semibold rounded-xl transition-all duration-150',
              'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700',
              'shadow-xl shadow-blue-900/40 hover:shadow-blue-800/50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950'
            )}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF Report
            <span className="text-sm font-normal text-blue-200">
              {job.companies.filter((c) => c.status === 'found').length} leads
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
