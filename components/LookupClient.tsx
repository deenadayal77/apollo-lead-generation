'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { LookupResult, Person } from '@/lib/types';

type State = 'idle' | 'loading' | 'success' | 'error';

const SENIORITY_LABELS: Record<string, string> = {
  owner: 'Owner',
  founder: 'Founder',
  c_suite: 'C-Suite',
  partner: 'Partner',
  vp: 'VP',
  head: 'Head',
  director: 'Director',
  manager: 'Manager',
  senior: 'Senior',
};

const SENIORITY_COLORS: Record<string, string> = {
  owner:    'bg-emerald-950 text-emerald-400 border-emerald-900',
  founder:  'bg-emerald-950 text-emerald-400 border-emerald-900',
  c_suite:  'bg-emerald-950 text-emerald-400 border-emerald-900',
  partner:  'bg-blue-950   text-blue-400    border-blue-900',
  vp:       'bg-blue-950   text-blue-400    border-blue-900',
  head:     'bg-indigo-950 text-indigo-400  border-indigo-900',
  director: 'bg-indigo-950 text-indigo-400  border-indigo-900',
  manager:  'bg-slate-800  text-slate-400   border-slate-700',
  senior:   'bg-slate-800  text-slate-400   border-slate-700',
};

function PersonCard({ person, index, total }: { person: Person; index: number; total: number }) {
  const seniorityLabel = SENIORITY_LABELS[person.seniority] ?? person.seniority;
  const seniorityColor =
    SENIORITY_COLORS[person.seniority] ?? 'bg-slate-800 text-slate-400 border-slate-700';

  return (
    <div
      className={clsx(
        'flex items-start gap-4 px-6 sm:px-8 py-4',
        index < total - 1 && 'border-b border-slate-800'
      )}
    >
      {/* Rank */}
      <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
        <span className="text-xs font-mono text-slate-500">{index + 1}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-slate-100 truncate">
            {person.name || '—'}
          </span>
          {person.seniority && (
            <span
              className={clsx(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                seniorityColor
              )}
            >
              {seniorityLabel}
            </span>
          )}
        </div>

        <p className="text-sm text-slate-400 mb-2">{person.title || '—'}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {person.email ? (
            <span className="text-sm text-blue-400 font-mono break-all">{person.email}</span>
          ) : (
            <span className="text-xs text-slate-600 italic">No email found</span>
          )}
          {person.phone && (
            <span className="text-sm text-slate-400 font-mono">{person.phone}</span>
          )}
          {person.location && (
            <span className="text-xs text-slate-500">{person.location}</span>
          )}
        </div>
      </div>

      {/* LinkedIn */}
      {person.linkedin_url && (
        <a
          href={person.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-1.5 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-slate-800 transition-colors"
          aria-label={`${person.name} LinkedIn profile`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      )}
    </div>
  );
}

export default function LookupClient() {
  const [url, setUrl]           = useState('');
  const [state, setState]       = useState<State>('idle');
  const [result, setResult]     = useState<LookupResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const isValidLinkedIn = url.includes('linkedin.com/company/');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidLinkedIn || state === 'loading') return;

    setState('loading');
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Lookup failed. Please try again.');
      }

      setResult(data as LookupResult);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setState('error');
    }
  };

  const handleDownloadPdf = async () => {
    if (!result || pdfLoading) return;
    setPdfLoading(true);
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      if (!res.ok) throw new Error('PDF generation failed');

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const slug = (result.company_url || 'company')
        .replace(/https?:\/\//, '')
        .replace(/www\.linkedin\.com\/company\//, '')
        .replace(/\//g, '')
        .slice(0, 30);
      link.href = blobUrl;
      link.download = `helixgtm-${slug}-leads.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // silent — user can retry
    } finally {
      setPdfLoading(false);
    }
  };

  const handleReset = () => {
    setState('idle');
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* ── Form ─────────────────────────────────────────── */}
      <div className="p-6 sm:p-8">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-100">Find Top Contacts</h2>
          <p className="text-slate-400 text-sm mt-1">
            Enter a LinkedIn company URL to get the top 5 senior decision-makers with emails
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="company-url" className="sr-only">
                LinkedIn Company URL
              </label>
              <input
                id="company-url"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="https://www.linkedin.com/company/acme-corp"
                disabled={state === 'loading'}
                className={clsx(
                  'w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  'transition-colors duration-150 disabled:opacity-50',
                  error ? 'border-red-700' : 'border-slate-700 hover:border-slate-600'
                )}
              />
            </div>

            <button
              type="submit"
              disabled={!isValidLinkedIn || state === 'loading'}
              className={clsx(
                'flex-shrink-0 flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                !isValidLinkedIn || state === 'loading'
                  ? 'bg-blue-700/40 text-blue-300/50 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/30'
              )}
            >
              {state === 'loading' ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              {state === 'loading' ? 'Looking up...' : 'Find Contacts'}
            </button>
          </div>

          {url.length > 0 && !isValidLinkedIn && (
            <p className="mt-2 text-xs text-amber-500">
              Must be a LinkedIn company URL — linkedin.com/company/...
            </p>
          )}
        </form>
      </div>

      {/* ── Loading ──────────────────────────────────────── */}
      {state === 'loading' && (
        <div className="border-t border-slate-800 px-6 sm:px-8 py-12 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
          <p className="text-sm text-slate-400">Finding senior contacts via Apollo…</p>
          <p className="text-xs text-slate-600">Usually takes 15 – 30 seconds</p>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────── */}
      {state === 'error' && error && (
        <div className="border-t border-slate-800 px-6 sm:px-8 py-6">
          <div className="flex items-start gap-3 bg-red-950 border border-red-800 rounded-xl px-4 py-3" role="alert">
            <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-red-300">{error}</p>
              <button onClick={handleReset} className="mt-2 text-xs text-red-400 hover:text-red-300 underline">
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────── */}
      {state === 'success' && result && (
        <div className="border-t border-slate-800">
          {/* Results header bar */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-3 bg-slate-950/50 border-b border-slate-800">
            <div>
              <span className="text-sm font-semibold text-slate-200">
                {result.total > 0
                  ? `${result.total} contact${result.total !== 1 ? 's' : ''} found`
                  : 'No contacts found'}
              </span>
              <p className="text-xs text-slate-600 mt-0.5 truncate max-w-xs">
                {result.company_url.replace(/https?:\/\//, '').replace('www.', '')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {result.total > 0 && (
                <button
                  onClick={handleDownloadPdf}
                  disabled={pdfLoading}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    'bg-slate-800 border border-slate-700 text-slate-300',
                    'hover:bg-slate-700 hover:text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {pdfLoading ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                    </svg>
                  )}
                  {pdfLoading ? 'Generating…' : 'Download PDF'}
                </button>
              )}

              <button
                onClick={handleReset}
                className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="New lookup"
                title="New lookup"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* People list */}
          {result.people.length > 0 ? (
            result.people.map((person, i) => (
              <PersonCard key={i} person={person} index={i} total={result.people.length} />
            ))
          ) : (
            <div className="px-6 sm:px-8 py-10 text-center">
              <p className="text-sm text-slate-400">No senior contacts found for this company.</p>
              <p className="text-xs text-slate-600 mt-1">
                Check that the company has a LinkedIn presence with senior staff listed.
              </p>
              <button onClick={handleReset} className="mt-4 text-sm text-blue-400 hover:text-blue-300">
                Try another company
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
