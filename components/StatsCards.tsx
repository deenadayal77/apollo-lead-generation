import type { CompanyResult } from '@/lib/types';

interface StatsCardsProps {
  companies: CompanyResult[];
}

export default function StatsCards({ companies }: StatsCardsProps) {
  const found = companies.filter((c) => c.status === 'found').length;
  const noEmail = companies.filter((c) => c.status === 'no_email').length;
  const notFound = companies.filter((c) => c.status === 'not_found').length;
  const enriching = companies.filter((c) => c.status === 'enriching').length;
  const pending = companies.filter((c) => c.status === 'pending').length;
  const errors = companies.filter((c) => c.status === 'error').length;

  const stats = [
    {
      label: 'Found',
      value: found,
      colorBorder: 'border-l-green-500',
      colorText: 'text-green-400',
      colorBg: 'bg-green-950/40',
      description: 'Contacts with email',
      icon: (
        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      label: 'No Email',
      value: noEmail,
      colorBorder: 'border-l-yellow-500',
      colorText: 'text-yellow-400',
      colorBg: 'bg-yellow-950/40',
      description: 'Contact found, no email',
      icon: (
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      label: 'Not Found',
      value: notFound,
      colorBorder: 'border-l-red-500',
      colorText: 'text-red-400',
      colorBg: 'bg-red-950/40',
      description: 'No contact data',
      icon: (
        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-slate-900 border border-slate-800 border-l-2 ${stat.colorBorder} ${stat.colorBg} rounded-xl p-4 sm:p-5`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${stat.colorText}`}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-600 mt-1 hidden sm:block">{stat.description}</p>
            </div>
            <div className="mt-0.5">{stat.icon}</div>
          </div>
        </div>
      ))}

      {/* Additional mini stats if there are enriching/pending/error */}
      {(enriching > 0 || pending > 0 || errors > 0) && (
        <div className="col-span-3 flex flex-wrap gap-2 pt-1">
          {enriching > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-950 border border-blue-800 text-blue-400 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {enriching} enriching
            </span>
          )}
          {pending > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-full">
              {pending} pending
            </span>
          )}
          {errors > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-red-950 border border-red-800 text-red-400 px-2.5 py-1 rounded-full">
              {errors} errors
            </span>
          )}
        </div>
      )}
    </div>
  );
}
