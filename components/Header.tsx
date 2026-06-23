'use client';

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo + tagline */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Helix icon */}
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
                aria-hidden="true"
              >
                <path
                  d="M12 3C8 3 5 6 5 9c0 2 1 3.5 3 4.5M12 3c4 0 7 3 7 6 0 2-1 3.5-3 4.5M12 3v18M5 13.5C3 14.5 2 16 2 18c0 2 2 3 4 3M19 13.5c2 1 3 2.5 3 4.5 0 2-2 3-4 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-100">
                Helix
                <span className="text-blue-400">GTM</span>
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-slate-700" aria-hidden="true" />

          {/* Tagline */}
          <span className="hidden sm:block text-xs text-slate-500 font-medium tracking-wide uppercase">
            Lead Enrichment Engine
          </span>
        </div>

        {/* Right: Apollo badge */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5"
            title="Data sourced from Apollo.io"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-3.5 h-3.5 text-blue-400"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M12 3v9l5 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs text-slate-400 font-medium">
              Powered by{' '}
              <span className="text-slate-200 font-semibold">Apollo.io</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
