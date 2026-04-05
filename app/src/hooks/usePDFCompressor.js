import { useState, useCallback, useRef } from 'react';
import { compressPDF } from '../utils/compressionEngine.js';
import { toBytes } from '../utils/fileUtils.js';

/**
 * Hook for PDF compression with progress tracking
 * @returns {Object} Compression state and controls
 */
export function usePDFCompressor() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Start compression
   * @param {ArrayBuffer} pdfData - PDF data to compress
   * @param {number} targetSize - Target size value
   * @param {string} targetUnit - Target size unit (KB or MB)
   * @param {string} qualityLevel - Quality level (HIGH, MEDIUM, LOW)
   * @param {Object} options - Additional options
   */
  const startCompression = useCallback(async (
    pdfData,
    targetSize,
    targetUnit,
    qualityLevel,
    options = {}
  ) => {
    setIsCompressing(true);
    setProgress(0);
    setStatus('Starting...');
    setResult(null);
    setError(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const targetSizeBytes = toBytes(targetSize, targetUnit);

      const compressionResult = await compressPDF(
        pdfData,
        targetSizeBytes,
        qualityLevel,
        {
          ...options,
          onProgress: (p) => setProgress(p),
          onStatus: (s) => setStatus(s),
          signal: abortControllerRef.current.signal,
        }
      );

      setResult({
        data: compressionResult.data,
        compressedSize: compressionResult.compressedSize,
        achievedQuality: compressionResult.achievedQuality,
        iterations: compressionResult.iterations,
        pageCount: compressionResult.pageCount,
        targetSize: targetSizeBytes,
      });

      setStatus('Complete!');
      setProgress(100);
    } catch (err) {
      if (err.message === 'Compression cancelled') {
        setStatus('Cancelled');
      } else {
        setError(err.message || 'Compression failed');
        setStatus('Error');
      }
    } finally {
      setIsCompressing(false);
    }
  }, []);

  /**
   * Cancel ongoing compression
   */
  const cancelCompression = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Reset compression state
   */
  const resetCompression = useCallback(() => {
    setIsCompressing(false);
    setProgress(0);
    setStatus('');
    setResult(null);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    isCompressing,
    progress,
    status,
    result,
    error,
    startCompression,
    cancelCompression,
    resetCompression,
  };
}
