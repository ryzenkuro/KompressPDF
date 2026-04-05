import React from 'react';
import { Loader2, X } from 'lucide-react';

/**
 * Progress bar component for compression status
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {string} props.status - Status message
 * @param {boolean} props.isCompressing - Whether compression is active
 * @param {Function} props.onCancel - Cancel handler
 */
export function ProgressBar({ progress, status, isCompressing, onCancel }) {
  if (!isCompressing && progress === 0) return null;

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {status || 'Processing...'}
          </span>
        </div>

        {isCompressing && onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            aria-label="Cancel compression"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Compression progress"
        >
          {isCompressing && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-progress" />
          )}
        </div>
      </div>

      {/* Percentage */}
      <div className="mt-2 text-right">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {clampedProgress.toFixed(0)}%
        </span>
      </div>

      {/* Estimated time (placeholder) */}
      {isCompressing && progress < 100 && progress > 10 && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          This may take a moment depending on file size...
        </p>
      )}
    </div>
  );
}
