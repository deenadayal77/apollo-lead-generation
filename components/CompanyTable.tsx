import clsx from 'clsx';
import type { CompanyResult } from '@/lib/types';
import { getStatusBadgeClass, getStatusLabel, formatUrl } from '@/lib/utils';

interface CompanyTableProps {
  companies: CompanyResult[];
}

function StatusBadge({ status }: { status: CompanyResult['status'] }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap',
        getStatusBadgeClass(status)
      )}
    >
      {status === 'enriching' && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
      )}
      {getStatusLabel(status)}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-t border-slate-800">
      <td className="px-4 py-3">
        <div className="space-y-1.5">
          <div className="h-3.5 w-32 bg-slate-800 rounded animate-pulse" />
          <div className="h-2.5 w-48 bg-slate-800/60 rounded animate-pulse" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 bg-slate-800 rounded animate-pulse" />
          <div className="h-2.5 w-20 bg-slate-800/60 rounded animate-pulse" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-3.5 w-36 bg-slate-800 rounded animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-6 w-20 bg-slate-800 rounded-full animate-pulse" />
      </td>
    </tr>
  );
}

function MobileCard({ company }: { company: CompanyResult }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
      {/* Company + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-200 truncate text-sm">
            {company.company_name || 'Unknown Company'}
          </p>
          {company.company_linkedin_url && (
            <a
              href={company.company_linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-blue-400 transition-colors truncate block"
              aria-label={`LinkedIn profile for ${company.company_name}`}
            >
              {formatUrl(company.company_linkedin_url)}
            </a>
          )}
        </div>
        <StatusBadge status={company.status} />
      </div>

      {/* Contact + email */}
      {(company.person_name || company.email) && (
        <div className="pt-2 border-t border-slate-800 space-y-1">
          {company.person_name && (
            <div className="flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 text-slate-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <div>
                <span className="text-xs text-slate-300">{company.person_name}</span>
                {company.title && (
                  <span className="text-xs text-slate-500"> · {company.title}</span>
                )}
              </div>
            </div>
          )}
          {company.email && (
            <div className="flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 text-slate-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <a
                href={`mailto:${company.email}`}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {company.email}
              </a>
            </div>
          )}
        </div>
      )}

      {company.reason && (
        <p className="text-xs text-slate-600 italic">{company.reason}</p>
      )}
    </div>
  );
}

export default function CompanyTable({ companies }: CompanyTableProps) {
  // Empty state — show skeleton rows
  if (companies.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Companies</span>
          <div className="h-4 w-16 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Companies enrichment status">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Company
                </th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Contact
                </th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Email
                </th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">Companies</span>
        <span className="text-xs text-slate-500 tabular-nums">{companies.length} total</span>
      </div>

      {/* Desktop table — hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full" aria-label="Companies enrichment status">
          <thead>
            <tr className="text-left border-b border-slate-800/50">
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Company
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Contact
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {companies.map((company, index) => (
              <tr
                key={`${company.company_linkedin_url}-${index}`}
                className="hover:bg-slate-800/30 transition-colors duration-100"
              >
                {/* Company */}
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {company.company_name || 'Unknown Company'}
                  </p>
                  <a
                    href={company.company_linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-blue-400 transition-colors truncate block"
                    aria-label={`LinkedIn profile for ${company.company_name}`}
                  >
                    {formatUrl(company.company_linkedin_url)}
                  </a>
                </td>

                {/* Contact */}
                <td className="px-4 py-3 max-w-xs">
                  {company.person_name ? (
                    <>
                      <p className="text-sm text-slate-300 truncate">{company.person_name}</p>
                      {company.title && (
                        <p className="text-xs text-slate-500 truncate">{company.title}</p>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-600 text-sm">—</span>
                  )}
                </td>

                {/* Email */}
                <td className="px-4 py-3 max-w-xs">
                  {company.email ? (
                    <a
                      href={`mailto:${company.email}`}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors truncate block"
                      aria-label={`Email ${company.person_name ?? company.company_name}`}
                    >
                      {company.email}
                    </a>
                  ) : (
                    <span className="text-slate-600 text-sm">—</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status={company.status} />
                  {company.reason && (
                    <p className="text-xs text-slate-600 mt-1 max-w-xs truncate" title={company.reason}>
                      {company.reason}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards — shown only on mobile */}
      <div className="md:hidden p-3 space-y-3">
        {companies.map((company, index) => (
          <MobileCard
            key={`${company.company_linkedin_url}-${index}`}
            company={company}
          />
        ))}
      </div>
    </div>
  );
}
