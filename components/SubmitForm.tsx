'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { parseLinkedInUrls, parseCSV } from '@/lib/utils';

export default function SubmitForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawUrls, setRawUrls] = useState('');
  const [urlCount, setUrlCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRawUrls(value);
    setUrlCount(parseLinkedInUrls(value).length);
    setError(null);
  };

  const handleCSVContent = useCallback((text: string) => {
    const urls = parseCSV(text);
    if (urls.length === 0) {
      setError('No LinkedIn company URLs found in CSV. Ensure the column is named "company_linkedin_url".');
      return;
    }
    const newText = urls.join('\n');
    setRawUrls(newText);
    setUrlCount(urls.length);
    setError(null);
  }, []);

  const handleFileUpload = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
        setError('Please upload a valid CSV file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        handleCSVContent(text);
      };
      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
      };
      reader.readAsText(file);
    },
    [handleCSVContent]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const csv = [
      'company_linkedin_url,company_name,domain',
      'https://www.linkedin.com/company/acme-corp,Acme Corp,acme.com',
      'https://www.linkedin.com/company/techcorp,TechCorp,techcorp.io',
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'helixhd-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const urls = parseLinkedInUrls(rawUrls);

    if (urls.length === 0) {
      setError('Please enter at least one valid LinkedIn company URL.');
      return;
    }

    if (urls.length > 100) {
      setError(`Too many URLs. Maximum is 100 per batch. You have ${urls.length}.`);
      return;
    }

    setLoading(true);

    try {
      const companies = urls.map((url) => ({ company_linkedin_url: url }));

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start enrichment. Please try again.');
      }

      router.push(`/status/${data.jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-100">Start Lead Enrichment</h2>
        <p className="text-slate-400 text-sm mt-1">
          Enter LinkedIn company URLs to find decision-maker contacts
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Textarea */}
        <div className="mb-4">
          <label
            htmlFor="linkedin-urls"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            LinkedIn Company URLs
          </label>
          <textarea
            id="linkedin-urls"
            value={rawUrls}
            onChange={handleTextareaChange}
            placeholder={
              'https://www.linkedin.com/company/acme\nhttps://www.linkedin.com/company/techcorp\nhttps://www.linkedin.com/company/startup-io\n...'
            }
            className={clsx(
              'w-full min-h-40 bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600',
              'resize-y font-mono leading-relaxed',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500',
              'transition-colors duration-150',
              error ? 'border-red-700' : 'border-slate-700 hover:border-slate-600'
            )}
            aria-label="LinkedIn company URLs, one per line"
            aria-describedby="url-count-badge"
            disabled={loading}
          />

          {/* URL count badge */}
          <div className="mt-2 flex items-center gap-2" id="url-count-badge">
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors duration-150',
                urlCount > 0
                  ? 'bg-green-950 text-green-400 border border-green-900'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              )}
            >
              {urlCount > 0 && (
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {urlCount === 0
                ? 'No LinkedIn URLs detected'
                : `${urlCount} LinkedIn URL${urlCount !== 1 ? 's' : ''} detected`}
            </span>

            {urlCount > 0 && (
              <span className="text-xs text-slate-600">
                {100 - urlCount} remaining (max 100)
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center my-5">
          <div className="flex-1 border-t border-slate-800" />
          <span className="flex-shrink-0 mx-4 text-xs text-slate-600 font-medium">
            — or upload a CSV —
          </span>
          <div className="flex-1 border-t border-slate-800" />
        </div>

        {/* CSV drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={clsx(
            'border-2 border-dashed rounded-xl p-6 text-center transition-all duration-150 mb-4',
            dragOver
              ? 'border-blue-500 bg-blue-950/30'
              : 'border-slate-700 hover:border-slate-600 bg-slate-950/30',
            loading && 'opacity-50 pointer-events-none'
          )}
          role="region"
          aria-label="CSV file drop zone"
        >
          <svg
            className={clsx(
              'w-8 h-8 mx-auto mb-2 transition-colors duration-150',
              dragOver ? 'text-blue-400' : 'text-slate-600'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p
            className={clsx(
              'text-sm font-medium transition-colors duration-150',
              dragOver ? 'text-blue-300' : 'text-slate-400'
            )}
          >
            {dragOver ? 'Drop your CSV here' : 'Drag & drop your CSV file here'}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            CSV must include a <code className="text-slate-500">company_linkedin_url</code> column
          </p>
        </div>

        {/* CSV action buttons */}
        <div className="flex gap-3 mb-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            aria-label="Upload CSV file"
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-150',
              'bg-slate-800 text-slate-300 border border-slate-700',
              'hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed'
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload CSV
          </button>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={loading}
            aria-label="Download CSV template"
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-150',
              'bg-slate-800 text-slate-300 border border-slate-700',
              'hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed'
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
            Download Template
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="CSV file input"
        />

        {/* Error message */}
        {error && (
          <div
            className="mb-4 flex items-start gap-3 bg-red-950 border border-red-800 rounded-xl px-4 py-3"
            role="alert"
            aria-live="polite"
          >
            <svg
              className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"
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
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || urlCount === 0}
          aria-label="Start lead enrichment"
          className={clsx(
            'w-full flex items-center justify-center gap-3 px-6 py-3.5 text-base font-semibold rounded-xl transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900',
            loading || urlCount === 0
              ? 'bg-blue-700/50 text-blue-300/50 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40'
          )}
        >
          {loading ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Starting enrichment...
            </>
          ) : (
            <>
              <span aria-hidden="true">🚀</span>
              Start Enrichment
              {urlCount > 0 && (
                <span className="text-sm font-normal text-blue-200">
                  ({urlCount} {urlCount === 1 ? 'company' : 'companies'})
                </span>
              )}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
