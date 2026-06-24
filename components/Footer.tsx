export default function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span className="font-semibold text-slate-400">
            Helix<span className="text-blue-400">HD</span>
          </span>
          <span>·</span>
          <span>© 2026 HelixHD. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Built with</span>
          <span className="inline-flex items-center gap-1.5 text-slate-400">
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
            Apollo.io
          </span>
        </div>
      </div>
    </footer>
  );
}
