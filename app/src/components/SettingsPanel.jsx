import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { SizeInput } from './SizeInput.jsx';
import { QualitySelector } from './QualitySelector.jsx';
import { SIZE_UNITS } from '../utils/constants.js';

/**
 * Settings panel component
 * @param {Object} props
 * @param {number} props.targetSize - Target size value
 * @param {string} props.targetUnit - Target size unit
 * @param {string} props.quality - Quality level
 * @param {boolean} props.removeMetadata - Remove metadata option
 * @param {boolean} props.removeFonts - Remove fonts option
 * @param {boolean} props.grayscale - Grayscale option
 * @param {number} props.originalSize - Original file size
 * @param {Function} props.onTargetSizeChange - Target size change handler
 * @param {Function} props.onTargetUnitChange - Target unit change handler
 * @param {Function} props.onQualityChange - Quality change handler
 * @param {Function} props.onRemoveMetadataChange - Remove metadata change handler
 * @param {Function} props.onRemoveFontsChange - Remove fonts change handler
 * @param {Function} props.onGrayscaleChange - Grayscale change handler
 */
export function SettingsPanel({
  targetSize,
  targetUnit,
  quality,
  removeMetadata,
  removeFonts,
  grayscale,
  originalSize,
  onTargetSizeChange,
  onTargetUnitChange,
  onQualityChange,
  onRemoveMetadataChange,
  onRemoveFontsChange,
  onGrayscaleChange,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
        <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Compression Settings
        </h2>
      </div>

      {/* Target Size */}
      <SizeInput
        value={targetSize}
        unit={targetUnit}
        onValueChange={onTargetSizeChange}
        onUnitChange={onTargetUnitChange}
        originalSize={originalSize}
      />

      {/* Quality Selector */}
      <QualitySelector
        value={quality}
        onChange={onQualityChange}
      />

      {/* Advanced Options */}
      <div className="pt-2">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          aria-expanded={showAdvanced}
        >
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 animate-fade-in">
            {/* Remove Metadata */}
            <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Remove Metadata
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Remove author, title, creation date
                </span>
              </div>
              <input
                type="checkbox"
                checked={removeMetadata}
                onChange={(e) => onRemoveMetadataChange(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                aria-label="Remove metadata"
              />
            </label>

            {/* Remove Fonts */}
            <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Remove Embedded Fonts
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  May affect text rendering
                </span>
              </div>
              <input
                type="checkbox"
                checked={removeFonts}
                onChange={(e) => onRemoveFontsChange(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                aria-label="Remove embedded fonts"
              />
            </label>

            {/* Grayscale */}
            <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grayscale Mode
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Convert all images to grayscale
                </span>
              </div>
              <input
                type="checkbox"
                checked={grayscale}
                onChange={(e) => onGrayscaleChange(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                aria-label="Convert to grayscale"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
