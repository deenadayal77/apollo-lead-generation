import clsx from 'clsx';
import { calcProgress } from '@/lib/utils';

interface ProgressBarProps {
  processedCount: number;
  totalCompanies: number;
  status: string;
}

export default function ProgressBar({ processedCount, totalCompanies, status }: ProgressBarProps) {
  const progress = calcProgress(processedCount, totalCompanies);
  const isRunning = status === 'running' || status === 'pending';
  const isComplete = status === 'complete';
  const isFailed = status === 'failed';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-300">Enrichment Progress</span>
          {isRunning && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
              Running
            </span>
          )}
          {isComplete && (
            <span className="inline-flex items-center gap-1 text-xs text-green-400">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Complete
            </span>
          )}
          {isFailed && (
            <span className="inline-flex items-center gap-1 text-xs text-red-400">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Failed
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-slate-200">{processedCount}</span>
          <span className="text-sm text-slate-500">/ {totalCompanies}</span>
          <span className="text-xs text-slate-600 ml-1">companies</span>
        </div>
      </div>

      {/* Progress bar track */}
      <div
        className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${progress}% complete`}
      >
        {/* Filled portion */}
        <div
          className={clsx(
            'h-full rounded-full progress-bar-fill',
            isFailed ? 'bg-red-600' : isComplete ? 'bg-green-500' : 'bg-blue-600'
          )}
          style={{ width: `${progress}%` }}
        />

        {/* Shimmer overlay on unfilled portion when running */}
        {isRunning && progress < 100 && (
          <div
            className="absolute inset-0 shimmer-bar"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Progress percentage */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-500">
          {isComplete
            ? 'All companies processed'
            : isFailed
            ? 'Job failed'
            : `${totalCompanies - processedCount} remaining`}
        </span>
        <span
          className={clsx(
            'text-xs font-semibold tabular-nums',
            isFailed ? 'text-red-400' : isComplete ? 'text-green-400' : 'text-blue-400'
          )}
        >
          {progress}%
        </span>
      </div>
    </div>
  );
}
