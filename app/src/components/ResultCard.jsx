import React, { useCallback } from 'react';
import { Download, RotateCcw, Share2, CheckCircle, FileDown } from 'lucide-react';
import { formatFileSize, calculateCompressionRatio, calculateSizeAccuracy, generateCompressedFilename, downloadFile } from '../utils/fileUtils.js';

/**
 * Result card component showing compression results
 * @param {Object} props
 * @param {Object} props.result - Compression result
 * @param {number} props.originalSize - Original file size
 * @param {string} props.originalName - Original file name
 * @param {Function} props.onReset - Reset handler
 */
export function ResultCard({ result, originalSize, originalName, onReset }) {
  const handleDownload = useCallback(() => {
    if (!result?.data) return;

    const blob = new Blob([result.data], { type: 'application/pdf' });
    const filename = generateCompressedFilename(originalName);
    downloadFile(blob, filename);
  }, [result, originalName]);

  const handleShare = useCallback(async () => {
    if (!result?.data) return;

    const blob = new Blob([result.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    try {
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], generateCompressedFilename(originalName), {
          type: 'application/pdf',
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Compressed PDF',
          });
          return;
        }
      }

      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(url);
      alert('Download link copied to clipboard!');
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, [result, originalName]);

  if (!result) return null;

  const compressionRatio = calculateCompressionRatio(originalSize, result.compressedSize);
  const sizeAccuracy = calculateSizeAccuracy(result.targetSize, result.compressedSize);
  const isAccurate = Math.abs(result.compressedSize - result.targetSize) / result.targetSize <= 0.15;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm animate-slide-in">
      {/* Success header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Compression Complete!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your PDF has been successfully compressed
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 py-4">
        {/* Original size */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Original Size</p>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {formatFileSize(originalSize)}
          </p>
        </div>

        {/* Compressed size */}
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs text-green-600 dark:text-green-400">Compressed Size</p>
          <p className="text-lg font-semibold text-green-700 dark:text-green-300">
            {formatFileSize(result.compressedSize)}
          </p>
        </div>

        {/* Compression ratio */}
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-xs text-indigo-600 dark:text-indigo-400">Reduction</p>
          <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
            {compressionRatio}
          </p>
        </div>

        {/* Page count */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pages</p>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {result.pageCount}
          </p>
        </div>
      </div>

      {/* Target accuracy */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Target Size Accuracy</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Target: {formatFileSize(result.targetSize)} | Achieved: {formatFileSize(result.compressedSize)}
            </p>
          </div>
          <div className={`text-right ${isAccurate ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
            <p className="text-lg font-semibold">{sizeAccuracy}</p>
            <p className="text-xs">{isAccurate ? 'accurate' : 'within range'}</p>
          </div>
        </div>
      </div>

      {/* Quality info */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          Quality setting: <span className="font-medium">{(result.achievedQuality * 100).toFixed(0)}%</span>
          {result.iterations > 1 && (
            <span className="ml-2 text-xs">({result.iterations} iterations)</span>
          )}
        </p>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          aria-label="Download compressed PDF"
        >
          <Download className="w-5 h-5" />
          Download Compressed PDF
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Share compressed PDF"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Compress another file"
          >
            <RotateCcw className="w-4 h-4" />
            Compress Another
          </button>
        </div>
      </div>
    </div>
  );
}
