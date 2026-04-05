// Quality presets for PDF compression
export const QUALITY_PRESETS = {
  HIGH: {
    name: 'High',
    quality: 0.9,
    dpi: 150,
    description: 'Minimal compression, preserves visuals',
  },
  MEDIUM: {
    name: 'Medium',
    quality: 0.6,
    dpi: 96,
    description: 'Balanced quality and size',
  },
  LOW: {
    name: 'Low',
    quality: 0.3,
    dpi: 72,
    description: 'Maximum compression, smaller file',
  },
};

// Compression settings
export const COMPRESSION_SETTINGS = {
  MAX_ITERATIONS: 10,
  SIZE_TOLERANCE: 0.15, // 15% tolerance
  QUALITY_STEP: 0.05,
  MIN_QUALITY: 0.1,
  MAX_QUALITY: 1.0,
};

// File size units
export const SIZE_UNITS = {
  KB: 'KB',
  MB: 'MB',
};

// Conversion factors
export const BYTES_PER_KB = 1024;
export const BYTES_PER_MB = 1024 * 1024;

// PDF.js worker configuration
export const PDFJS_WORKER_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

// Toast durations
export const TOAST_DURATION = 4000;

// Animation durations (ms)
export const ANIMATION_DURATION = 300;

// Supported MIME types
export const SUPPORTED_MIME_TYPES = ['application/pdf'];

// Maximum file size (100 MB)
export const MAX_FILE_SIZE = 100 * 1024 * 1024;
