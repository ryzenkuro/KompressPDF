import { BYTES_PER_KB, BYTES_PER_MB, SIZE_UNITS, SUPPORTED_MIME_TYPES, MAX_FILE_SIZE } from './constants.js';

/**
 * Format file size to human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "1.5 MB" or "500 KB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  if (bytes >= BYTES_PER_MB) {
    return `${(bytes / BYTES_PER_MB).toFixed(2)} MB`;
  } else if (bytes >= BYTES_PER_KB) {
    return `${(bytes / BYTES_PER_KB).toFixed(1)} KB`;
  } else {
    return `${bytes} B`;
  }
}

/**
 * Convert size to bytes from given unit
 * @param {number} value - Size value
 * @param {string} unit - Unit (KB or MB)
 * @returns {number} Size in bytes
 */
export function toBytes(value, unit) {
  if (unit === SIZE_UNITS.MB) {
    return value * BYTES_PER_MB;
  }
  return value * BYTES_PER_KB;
}

/**
 * Convert bytes to target unit
 * @param {number} bytes - Size in bytes
 * @param {string} unit - Target unit (KB or MB)
 * @returns {number} Converted value
 */
export function fromBytes(bytes, unit) {
  if (unit === SIZE_UNITS.MB) {
    return bytes / BYTES_PER_MB;
  }
  return bytes / BYTES_PER_KB;
}

/**
 * Validate file type
 * @param {File} file - File to validate
 * @returns {boolean} True if valid PDF
 */
export function isValidPDFFile(file) {
  return file && SUPPORTED_MIME_TYPES.includes(file.type);
}

/**
 * Validate file size
 * @param {File} file - File to validate
 * @returns {boolean} True if within limits
 */
export function isValidFileSize(file) {
  return file && file.size <= MAX_FILE_SIZE;
}

/**
 * Get file validation error message
 * @param {File} file - File to check
 * @returns {string|null} Error message or null if valid
 */
export function getFileValidationError(file) {
  if (!file) {
    return 'No file selected';
  }
  
  if (!isValidPDFFile(file)) {
    return 'Please upload a valid PDF file';
  }
  
  if (!isValidFileSize(file)) {
    return `File size exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`;
  }
  
  return null;
}

/**
 * Calculate compression ratio
 * @param {number} originalSize - Original file size in bytes
 * @param {number} compressedSize - Compressed file size in bytes
 * @returns {string} Compression ratio percentage
 */
export function calculateCompressionRatio(originalSize, compressedSize) {
  if (originalSize === 0) return '0%';
  const ratio = ((originalSize - compressedSize) / originalSize) * 100;
  return `${ratio.toFixed(1)}%`;
}

/**
 * Calculate size accuracy percentage
 * @param {number} targetSize - Target size in bytes
 * @param {number} achievedSize - Achieved size in bytes
 * @returns {string} Accuracy percentage
 */
export function calculateSizeAccuracy(targetSize, achievedSize) {
  if (targetSize === 0) return '0%';
  const accuracy = (achievedSize / targetSize) * 100;
  return `${accuracy.toFixed(1)}%`;
}

/**
 * Generate compressed filename
 * @param {string} originalName - Original filename
 * @returns {string} Compressed filename
 */
export function generateCompressedFilename(originalName) {
  const nameWithoutExt = originalName.replace(/\.pdf$/i, '');
  return `${nameWithoutExt}_compressed.pdf`;
}

/**
 * Read file as ArrayBuffer
 * @param {File} file - File to read
 * @returns {Promise<ArrayBuffer>} File contents
 */
export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read file as DataURL
 * @param {File} file - File to read
 * @returns {Promise<string>} DataURL
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Download file to browser
 * @param {Blob} blob - File blob
 * @param {string} filename - Download filename
 */
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
