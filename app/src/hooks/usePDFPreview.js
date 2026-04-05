import { useState, useCallback, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFJS_WORKER_URL } from '../utils/constants.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

/**
 * Hook for generating PDF preview thumbnail
 * @returns {Object} Preview state and controls
 */
export function usePDFPreview() {
  const [thumbnail, setThumbnail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const abortControllerRef = useRef(null);

  /**
   * Generate preview from PDF file
   * @param {File|ArrayBuffer} pdfSource - PDF file or ArrayBuffer
   */
  const generatePreview = useCallback(async (pdfSource) => {
    setIsLoading(true);
    setError(null);
    setThumbnail(null);
    setPageCount(0);

    // Cancel any previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      let pdfData;

      if (pdfSource instanceof File) {
        pdfData = await pdfSource.arrayBuffer();
      } else if (pdfSource instanceof ArrayBuffer) {
        pdfData = pdfSource;
      } else {
        throw new Error('Invalid PDF source');
      }

      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setPageCount(pdf.numPages);

      // Render first page
      const page = await pdf.getPage(1);
      
      // Calculate scale to fit within 300px width
      const viewport = page.getViewport({ scale: 1.0 });
      const maxWidth = 300;
      const scale = Math.min(maxWidth / viewport.width, 1.5);
      const scaledViewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      // Fill white background
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise;

      if (abortControllerRef.current.signal.aborted) {
        canvas.remove();
        return;
      }

      const dataUrl = canvas.toDataURL('image/png');
      setThumbnail(dataUrl);
      canvas.remove();
    } catch (err) {
      if (err.message !== 'Preview generation cancelled') {
        setError(err.message || 'Failed to generate preview');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear preview
   */
  const clearPreview = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setThumbnail(null);
    setIsLoading(false);
    setError(null);
    setPageCount(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    thumbnail,
    isLoading,
    error,
    pageCount,
    generatePreview,
    clearPreview,
  };
}
