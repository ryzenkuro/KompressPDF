import React, { useState, useCallback, useEffect } from 'react';
import { FileText, Zap, Shield, Lock } from 'lucide-react';
import { UploadZone } from './components/UploadZone.jsx';
import { PDFPreview } from './components/PDFPreview.jsx';
import { SettingsPanel } from './components/SettingsPanel.jsx';
import { ProgressBar } from './components/ProgressBar.jsx';
import { ResultCard } from './components/ResultCard.jsx';
import { ToastContainer } from './components/Toast.jsx';
import { usePDFCompressor } from './hooks/usePDFCompressor.js';
import { usePDFPreview } from './hooks/usePDFPreview.js';
import { useToast } from './hooks/useToast.js';
import { SIZE_UNITS, QUALITY_PRESETS } from './utils/constants.js';
import { readFileAsArrayBuffer, toBytes } from './utils/fileUtils.js';
import './App.css';

function App() {
  // File state
  const [file, setFile] = useState(null);
  const [pdfData, setPdfData] = useState(null);

  // Settings state
  const [targetSize, setTargetSize] = useState('');
  const [targetUnit, setTargetUnit] = useState(SIZE_UNITS.MB);
  const [quality, setQuality] = useState('MEDIUM');
  const [removeMetadata, setRemoveMetadata] = useState(false);
  const [removeFonts, setRemoveFonts] = useState(false);
  const [grayscale, setGrayscale] = useState(false);

  // Hooks
  const { thumbnail, isLoading: isPreviewLoading, pageCount, generatePreview, clearPreview } = usePDFPreview();
  const { isCompressing, progress, status, result, error: compressionError, startCompression, cancelCompression, resetCompression } = usePDFCompressor();
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFile) => {
    setFile(selectedFile);
    
    try {
      const arrayBuffer = await readFileAsArrayBuffer(selectedFile);
      setPdfData(arrayBuffer);
      generatePreview(arrayBuffer);
      
      // Set default target size to 50% of original
      const defaultTargetMB = (selectedFile.size * 0.5) / (1024 * 1024);
      if (defaultTargetMB >= 0.1) {
        setTargetSize(Math.round(defaultTargetMB * 10) / 10);
        setTargetUnit(SIZE_UNITS.MB);
      } else {
        setTargetSize(Math.round(selectedFile.size * 0.5 / 1024));
        setTargetUnit(SIZE_UNITS.KB);
      }
      
      showSuccess('PDF loaded successfully!');
    } catch (err) {
      showError('Failed to load PDF: ' + err.message);
      setFile(null);
      setPdfData(null);
    }
  }, [generatePreview, showSuccess, showError]);

  // Handle file clear
  const handleFileClear = useCallback(() => {
    setFile(null);
    setPdfData(null);
    clearPreview();
    resetCompression();
    setTargetSize('');
  }, [clearPreview, resetCompression]);

  // Handle compression start
  const handleCompress = useCallback(async () => {
    if (!pdfData || !file) {
      showError('Please select a PDF file first');
      return;
    }

    if (!targetSize || targetSize <= 0) {
      showError('Please enter a valid target size');
      return;
    }

    const targetBytes = toBytes(targetSize, targetUnit);
    if (targetBytes >= file.size) {
      showError('Target size must be smaller than original file size');
      return;
    }

    await startCompression(pdfData, targetSize, targetUnit, quality, {
      removeMetadata,
      removeFonts,
      grayscale,
    });
  }, [pdfData, file, targetSize, targetUnit, quality, removeMetadata, removeFonts, grayscale, startCompression, showError]);

  // Handle reset after compression
  const handleReset = useCallback(() => {
    handleFileClear();
  }, [handleFileClear]);

  // Show compression errors
  useEffect(() => {
    if (compressionError) {
      showError(compressionError);
    }
  }, [compressionError, showError]);

  // Show success when compression completes
  useEffect(() => {
    if (result && !isCompressing) {
      showSuccess('PDF compressed successfully!');
    }
  }, [result, isCompressing, showSuccess]);

  // Check if form is valid
  const isValid = file && targetSize > 0 && toBytes(targetSize, targetUnit) < file.size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                PDF Compressor
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Reduce file size without losing quality
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Features */}
        {!file && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Zap className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Fast & Efficient</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Client-side processing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Shield className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Secure</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Files never leave your device</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Lock className="w-8 h-8 text-indigo-500" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Private</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">No data collection</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Upload & Preview */}
          <div className="space-y-6">
            <UploadZone
              file={file}
              onFileSelect={handleFileSelect}
              onFileClear={handleFileClear}
              onError={showError}
            />

            {file && (
              <PDFPreview
                thumbnail={thumbnail}
                isLoading={isPreviewLoading}
                pageCount={pageCount}
                fileName={file.name}
                fileSize={file.size}
              />
            )}

            {/* Compression progress */}
            {(isCompressing || progress > 0) && (
              <ProgressBar
                progress={progress}
                status={status}
                isCompressing={isCompressing}
                onCancel={cancelCompression}
              />
            )}

            {/* Results */}
            {result && !isCompressing && (
              <ResultCard
                result={result}
                originalSize={file?.size || 0}
                originalName={file?.name || 'document.pdf'}
                onReset={handleReset}
              />
            )}
          </div>

          {/* Right column - Settings */}
          <div className="space-y-6">
            {file ? (
              <>
                <SettingsPanel
                  targetSize={targetSize}
                  targetUnit={targetUnit}
                  quality={quality}
                  removeMetadata={removeMetadata}
                  removeFonts={removeFonts}
                  grayscale={grayscale}
                  originalSize={file.size}
                  onTargetSizeChange={setTargetSize}
                  onTargetUnitChange={setTargetUnit}
                  onQualityChange={setQuality}
                  onRemoveMetadataChange={setRemoveMetadata}
                  onRemoveFontsChange={setRemoveFonts}
                  onGrayscaleChange={setGrayscale}
                />

                {/* Compress button */}
                {!result && (
                  <button
                    onClick={handleCompress}
                    disabled={!isValid || isCompressing}
                    className={`
                      w-full py-4 px-6 rounded-xl font-semibold text-lg
                      flex items-center justify-center gap-2
                      transition-all duration-200
                      ${isValid && !isCompressing
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }
                    `}
                    aria-label="Start compression"
                  >
                    <Zap className="w-5 h-5" />
                    {isCompressing ? 'Compressing...' : 'Compress PDF'}
                  </button>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  No file selected
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload a PDF file to see compression settings
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            PDF Compressor - All processing happens in your browser. Your files are never uploaded to any server.
          </p>
        </div>
      </footer>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
