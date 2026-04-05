import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { QUALITY_PRESETS, COMPRESSION_SETTINGS } from './constants.js';
import { clamp } from './fileUtils.js';

// Configure PDF.js worker
import { PDFJS_WORKER_URL } from './constants.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

/**
 * Compress PDF file using multi-pass algorithm
 * @param {ArrayBuffer} pdfData - Original PDF data
 * @param {number} targetSizeBytes - Target file size in bytes
 * @param {string} qualityLevel - Quality level (HIGH, MEDIUM, LOW)
 * @param {Object} options - Additional compression options
 * @returns {Promise<Object>} Compression result
 */
export async function compressPDF(
  pdfData,
  targetSizeBytes,
  qualityLevel = 'MEDIUM',
  options = {}
) {
  const {
    removeMetadata = false,
    removeFonts = false,
    grayscale = false,
    onProgress = () => {},
    onStatus = () => {},
    signal = null,
  } = options;

  const preset = QUALITY_PRESETS[qualityLevel] || QUALITY_PRESETS.MEDIUM;
  let currentQuality = preset.quality;
  let currentDPI = preset.dpi;
  let iteration = 0;
  let bestResult = null;
  let bestSizeDiff = Infinity;

  onStatus('Analyzing PDF...');
  onProgress(5);

  // Load PDF with pdfjs-dist for rendering
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const pageCount = pdf.numPages;

  onStatus(`Found ${pageCount} page${pageCount > 1 ? 's' : ''}`);
  onProgress(10);

  // Load PDF with pdf-lib for reconstruction
  const pdfDoc = await PDFDocument.load(pdfData);

  // Remove metadata if requested
  if (removeMetadata) {
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');
  }

  // Multi-pass compression loop
  while (iteration < COMPRESSION_SETTINGS.MAX_ITERATIONS) {
    if (signal?.aborted) {
      throw new Error('Compression cancelled');
    }

    onStatus(`Compression pass ${iteration + 1}/${COMPRESSION_SETTINGS.MAX_ITERATIONS}`);

    try {
      const result = await compressWithSettings(
        pdf,
        pdfDoc,
        pageCount,
        currentQuality,
        currentDPI,
        grayscale,
        onProgress,
        onStatus,
        signal
      );

      const compressedSize = result.byteLength;
      const sizeDiff = Math.abs(compressedSize - targetSizeBytes);
      const sizeRatio = compressedSize / targetSizeBytes;

      // Track best result
      if (sizeDiff < bestSizeDiff) {
        bestSizeDiff = sizeDiff;
        bestResult = {
          data: result,
          size: compressedSize,
          quality: currentQuality,
          dpi: currentDPI,
          iteration: iteration + 1,
        };
      }

      // Check if within tolerance
      if (sizeRatio >= (1 - COMPRESSION_SETTINGS.SIZE_TOLERANCE) && 
          sizeRatio <= (1 + COMPRESSION_SETTINGS.SIZE_TOLERANCE)) {
        // Target achieved
        break;
      }

      // Adjust quality for next iteration
      if (compressedSize > targetSizeBytes) {
        // Too large, reduce quality
        currentQuality = clamp(
          currentQuality - COMPRESSION_SETTINGS.QUALITY_STEP,
          COMPRESSION_SETTINGS.MIN_QUALITY,
          COMPRESSION_SETTINGS.MAX_QUALITY
        );
        currentDPI = Math.max(currentDPI * 0.9, 72);
      } else if (sizeRatio < (1 - COMPRESSION_SETTINGS.SIZE_TOLERANCE * 2)) {
        // Too small and significantly under target, increase quality
        currentQuality = clamp(
          currentQuality + COMPRESSION_SETTINGS.QUALITY_STEP * 0.5,
          COMPRESSION_SETTINGS.MIN_QUALITY,
          COMPRESSION_SETTINGS.MAX_QUALITY
        );
        currentDPI = Math.min(currentDPI * 1.05, 150);
      } else {
        // Close enough, accept the result
        break;
      }

      iteration++;
    } catch (error) {
      if (error.message === 'Compression cancelled') {
        throw error;
      }
      console.error('Compression iteration failed:', error);
      iteration++;
    }
  }

  if (!bestResult) {
    throw new Error('Failed to compress PDF');
  }

  onStatus('Finalizing...');
  onProgress(100);

  return {
    data: bestResult.data,
    compressedSize: bestResult.size,
    achievedQuality: bestResult.quality,
    iterations: bestResult.iteration,
    pageCount,
  };
}

/**
 * Compress PDF with specific settings
 * @param {Object} pdf - PDF.js document
 * @param {Object} pdfDoc - pdf-lib document
 * @param {number} pageCount - Number of pages
 * @param {number} quality - JPEG quality (0-1)
 * @param {number} dpi - Target DPI
 * @param {boolean} grayscale - Convert to grayscale
 * @param {Function} onProgress - Progress callback
 * @param {Function} onStatus - Status callback
 * @param {AbortSignal} signal - Abort signal
 * @returns {Promise<Uint8Array>} Compressed PDF data
 */
async function compressWithSettings(
  pdf,
  pdfDoc,
  pageCount,
  quality,
  dpi,
  grayscale,
  onProgress,
  onStatus,
  signal
) {
  // Create a new PDF document
  const newPdfDoc = await PDFDocument.create();

  // Calculate scale based on DPI (assuming 72 DPI baseline)
  const scale = dpi / 72;

  for (let i = 1; i <= pageCount; i++) {
    if (signal?.aborted) {
      throw new Error('Compression cancelled');
    }

    onStatus(`Compressing page ${i} of ${pageCount}`);
    const progress = 10 + ((i / pageCount) * 80);
    onProgress(progress);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    // Create canvas for rendering
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Fill white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render page to canvas
    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    // Apply grayscale if requested
    if (grayscale) {
      applyGrayscale(ctx, canvas.width, canvas.height);
    }

    // Convert canvas to JPEG with specified quality
    const imageData = canvas.toDataURL('image/jpeg', quality);

    // Embed image in new PDF
    const jpgImage = await newPdfDoc.embedJpg(imageData);

    // Add page with original dimensions
    const newPage = newPdfDoc.addPage([viewport.width / scale, viewport.height / scale]);

    // Draw image on page
    newPage.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: viewport.width / scale,
      height: viewport.height / scale,
    });

    // Clean up
    canvas.remove();
  }

  onStatus('Optimizing...');
  onProgress(95);

  // Save compressed PDF
  const compressedBytes = await newPdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return compressedBytes;
}

/**
 * Apply grayscale filter to canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function applyGrayscale(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Quick compress - single pass with fixed settings
 * @param {ArrayBuffer} pdfData - Original PDF data
 * @param {string} qualityLevel - Quality level
 * @returns {Promise<Uint8Array>} Compressed PDF
 */
export async function quickCompress(pdfData, qualityLevel = 'MEDIUM') {
  const preset = QUALITY_PRESETS[qualityLevel] || QUALITY_PRESETS.MEDIUM;
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const pageCount = pdf.numPages;
  const newPdfDoc = await PDFDocument.create();
  const scale = preset.dpi / 72;

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    const imageData = canvas.toDataURL('image/jpeg', preset.quality);
    const jpgImage = await newPdfDoc.embedJpg(imageData);

    const newPage = newPdfDoc.addPage([viewport.width / scale, viewport.height / scale]);
    newPage.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: viewport.width / scale,
      height: viewport.height / scale,
    });

    canvas.remove();
  }

  return await newPdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
}
