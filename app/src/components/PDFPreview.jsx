import React from 'react';
import { FileText, Loader2 } from 'lucide-react';

/**
 * PDF Preview component - shows thumbnail of first page
 * @param {Object} props
 * @param {string} props.thumbnail - Thumbnail data URL
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.error - Error message
 * @param {number} props.pageCount - Number of pages
 * @param {string} props.fileName - PDF file name
 * @param {number} props.fileSize - File size in bytes
 */
export function PDFPreview({
  thumbnail,
  isLoading,
  error,
  pageCount,
  fileName,
  fileSize,
}) {
  const formatSize = (bytes) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        PDF Preview
      </h3>

      <div className="relative">
        {/* Thumbnail container */}
        <div className="aspect-[3/4] max-h-64 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Loading preview...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <FileText className="w-12 h-12" />
              <span className="text-sm text-center px-4">{error}</span>
            </div>
          ) : thumbnail ? (
            <img
              src={thumbnail}
              alt="PDF preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <FileText className="w-12 h-12" />
              <span className="text-sm">No preview available</span>
            </div>
          )}
        </div>

        {/* Page count badge */}
        {pageCount > 0 && !isLoading && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            {pageCount} page{pageCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* File info */}
      {fileName && (
        <div className="mt-3 space-y-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {fileName}
          </p>
          {fileSize > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Original size: {formatSize(fileSize)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
