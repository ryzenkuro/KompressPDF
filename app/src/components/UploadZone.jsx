import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { getFileValidationError, isValidPDFFile } from '../utils/fileUtils.js';

/**
 * Upload zone component with drag & drop support
 * @param {Object} props
 * @param {File} props.file - Selected file
 * @param {Function} props.onFileSelect - File select handler
 * @param {Function} props.onFileClear - File clear handler
 * @param {Function} props.onError - Error handler
 */
export function UploadZone({ file, onFileSelect, onFileClear, onError }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    const error = getFileValidationError(droppedFile);
    if (error) {
      onError(error);
      return;
    }

    onFileSelect(droppedFile);
  }, [onFileSelect, onError]);

  const handleFileInput = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const error = getFileValidationError(selectedFile);
    if (error) {
      onError(error);
      return;
    }

    onFileSelect(selectedFile);
  }, [onFileSelect, onError]);

  const handleClear = useCallback(() => {
    onFileClear();
  }, [onFileClear]);

  // Show selected file state
  if (file) {
    return (
      <div className="animate-fade-in">
        <div className="relative bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
            aria-label="Remove file"
          >
            <X className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center">
              <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Ready
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          Upload another file to replace
        </p>
      </div>
    );
  }

  // Show upload zone
  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center
        transition-all duration-200 cursor-pointer
        ${isDragging
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }
      `}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload PDF file"
      />

      <div className="space-y-4">
        <div className={`
          mx-auto w-16 h-16 rounded-full flex items-center justify-center
          ${isDragging
            ? 'bg-indigo-100 dark:bg-indigo-800'
            : 'bg-gray-100 dark:bg-gray-800'
          }
        `}>
          <Upload className={`
            w-8 h-8
            ${isDragging
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 dark:text-gray-400'
            }
          `} />
        </div>

        <div>
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">
            {isDragging ? 'Drop PDF here' : 'Drag & drop your PDF here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            or click to browse
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <AlertCircle className="w-4 h-4" />
          <span>Supports PDF files up to 100 MB</span>
        </div>
      </div>
    </div>
  );
}
