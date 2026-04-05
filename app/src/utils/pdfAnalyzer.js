import * as pdfjsLib from 'pdfjs-dist';
import { PDFJS_WORKER_URL } from './constants.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

/**
 * Analyze PDF file and extract metadata
 * @param {ArrayBuffer} pdfData - PDF file data
 * @returns {Promise<Object>} PDF metadata
 */
export async function analyzePDF(pdfData) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    
    const metadata = {
      pageCount: pdf.numPages,
      info: null,
    };
    
    // Try to get document metadata
    try {
      const info = await pdf.getMetadata();
      metadata.info = info.info;
    } catch (e) {
      // Metadata might not be available
      metadata.info = {};
    }
    
    return metadata;
  } catch (error) {
    throw new Error(`Failed to analyze PDF: ${error.message}`);
  }
}

/**
 * Get page count from PDF
 * @param {ArrayBuffer} pdfData - PDF file data
 * @returns {Promise<number>} Number of pages
 */
export async function getPageCount(pdfData) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    return pdf.numPages;
  } catch (error) {
    throw new Error(`Failed to get page count: ${error.message}`);
  }
}

/**
 * Render PDF page to canvas
 * @param {ArrayBuffer} pdfData - PDF file data
 * @param {number} pageNumber - Page number to render (1-based)
 * @param {number} scale - Render scale
 * @returns {Promise<HTMLCanvasElement>} Canvas with rendered page
 */
export async function renderPageToCanvas(pdfData, pageNumber = 1, scale = 1.0) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    
    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      throw new Error(`Invalid page number: ${pageNumber}`);
    }
    
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
    
    return canvas;
  } catch (error) {
    throw new Error(`Failed to render page: ${error.message}`);
  }
}

/**
 * Extract images from PDF page
 * @param {ArrayBuffer} pdfData - PDF file data
 * @param {number} pageNumber - Page number
 * @returns {Promise<Array>} Array of image data
 */
export async function extractImagesFromPage(pdfData, pageNumber = 1) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const page = await pdf.getPage(pageNumber);
    const operatorList = await page.getOperatorList();
    
    const images = [];
    const imageOps = [
      pdfjsLib.OPS.paintImageXObject,
      pdfjsLib.OPS.paintImageXObjectRepeat,
      pdfjsLib.OPS.paintJpegXObject,
    ];
    
    for (let i = 0; i < operatorList.fnArray.length; i++) {
      if (imageOps.includes(operatorList.fnArray[i])) {
        const imageName = operatorList.argsArray[i][0];
        try {
          const image = await page.objs.get(imageName);
          if (image) {
            images.push(image);
          }
        } catch (e) {
          // Image might not be accessible
        }
      }
    }
    
    return images;
  } catch (error) {
    throw new Error(`Failed to extract images: ${error.message}`);
  }
}

/**
 * Get page dimensions
 * @param {ArrayBuffer} pdfData - PDF file data
 * @param {number} pageNumber - Page number
 * @returns {Promise<Object>} Page dimensions
 */
export async function getPageDimensions(pdfData, pageNumber = 1) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.0 });
    
    return {
      width: viewport.width,
      height: viewport.height,
    };
  } catch (error) {
    throw new Error(`Failed to get page dimensions: ${error.message}`);
  }
}

/**
 * Check if PDF is password protected
 * @param {ArrayBuffer} pdfData - PDF file data
 * @returns {Promise<boolean>} True if password protected
 */
export async function isPasswordProtected(pdfData) {
  try {
    await pdfjsLib.getDocument({ data: pdfData }).promise;
    return false;
  } catch (error) {
    if (error.name === 'PasswordException') {
      return true;
    }
    return false;
  }
}
