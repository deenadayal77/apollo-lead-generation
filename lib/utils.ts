import type { CompanyStatus, JobStatus } from './types';

/**
 * Parses a multiline text input and extracts valid LinkedIn company URLs.
 */
export function parseLinkedInUrls(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.includes('linkedin.com/company/'));
}

/**
 * Parses CSV text and extracts the company_linkedin_url column values.
 * Handles both comma and tab delimiters.
 */
export function parseCSV(text: string): string[] {
  const lines = text.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter: tab or comma
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  // Parse headers
  const headers = firstLine
    .split(delimiter)
    .map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

  const urlColumnIndex = headers.findIndex(
    (h) => h === 'company_linkedin_url' || h === 'linkedin_url' || h === 'url'
  );

  if (urlColumnIndex === -1) return [];

  const urls: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    const url = cols[urlColumnIndex];
    if (url && url.includes('linkedin.com/company/')) {
      urls.push(url);
    }
  }

  return urls;
}

/**
 * Returns Tailwind CSS class string for a status badge.
 */
export function getStatusBadgeClass(status: CompanyStatus | JobStatus): string {
  switch (status) {
    case 'found':
      return 'bg-green-950 text-green-400 border border-green-800';
    case 'not_found':
    case 'failed':
    case 'error':
      return 'bg-red-950 text-red-400 border border-red-800';
    case 'no_email':
      return 'bg-yellow-950 text-yellow-400 border border-yellow-800';
    case 'enriching':
    case 'running':
      return 'bg-blue-950 text-blue-400 border border-blue-800 animate-pulse';
    case 'pending':
    default:
      return 'bg-slate-800 text-slate-400 border border-slate-700';
  }
}

/**
 * Returns a human-readable label for a status value.
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    found: 'Found',
    not_found: 'Not Found',
    no_email: 'No Email',
    pending: 'Pending',
    enriching: 'Enriching...',
    error: 'Error',
    running: 'Running',
    complete: 'Complete',
    failed: 'Failed',
  };
  return labels[status] ?? status;
}

/**
 * Strips protocol and trailing slash from a URL for display.
 */
export function formatUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/**
 * Calculates enrichment progress as a 0-100 integer.
 */
export function calcProgress(processed: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((processed / total) * 100));
}
