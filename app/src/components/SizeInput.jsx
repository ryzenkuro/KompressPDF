import React, { useState, useEffect } from 'react';
import { SIZE_UNITS, BYTES_PER_MB, BYTES_PER_KB } from '../utils/constants.js';

/**
 * Size input component with unit toggle
 * @param {Object} props
 * @param {number} props.value - Size value
 * @param {string} props.unit - Size unit (KB or MB)
 * @param {Function} props.onValueChange - Value change handler
 * @param {Function} props.onUnitChange - Unit change handler
 * @param {number} props.originalSize - Original file size in bytes
 * @param {string} props.error - Error message
 */
export function SizeInput({
  value,
  unit,
  onValueChange,
  onUnitChange,
  originalSize,
  error,
}) {
  const [localError, setLocalError] = useState('');

  // Validate input
  useEffect(() => {
    if (!value || value <= 0) {
      setLocalError('Size must be greater than 0');
      return;
    }

    const sizeInBytes = unit === SIZE_UNITS.MB
      ? value * BYTES_PER_MB
      : value * BYTES_PER_KB;

    if (originalSize > 0 && sizeInBytes >= originalSize) {
      setLocalError('Target size must be smaller than original');
      return;
    }

    setLocalError('');
  }, [value, unit, originalSize]);

  const handleValueChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (isNaN(newValue) || newValue < 0) {
      onValueChange('');
      return;
    }
    onValueChange(newValue);
  };

  const handleUnitToggle = () => {
    const newUnit = unit === SIZE_UNITS.MB ? SIZE_UNITS.KB : SIZE_UNITS.MB;
    
    // Convert value to new unit
    if (value) {
      let bytes;
      if (unit === SIZE_UNITS.MB) {
        bytes = value * BYTES_PER_MB;
      } else {
        bytes = value * BYTES_PER_KB;
      }
      
      const newValue = newUnit === SIZE_UNITS.MB
        ? bytes / BYTES_PER_MB
        : bytes / BYTES_PER_KB;
      
      onValueChange(Math.round(newValue * 100) / 100);
    }
    
    onUnitChange(newUnit);
  };

  // Calculate recommended minimum (20% of original)
  const recommendedMin = originalSize > 0
    ? unit === SIZE_UNITS.MB
      ? (originalSize * 0.2 / BYTES_PER_MB).toFixed(1)
      : (originalSize * 0.2 / BYTES_PER_KB).toFixed(0)
    : null;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Target Size
      </label>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="number"
            value={value}
            onChange={handleValueChange}
            min="0.1"
            step={unit === SIZE_UNITS.MB ? '0.1' : '1'}
            placeholder="Enter size"
            className={`
              w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${error || localError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600'
              }
            `}
            aria-label="Target size value"
            aria-invalid={!!(error || localError)}
          />
        </div>

        <button
          onClick={handleUnitToggle}
          className="
            px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
            bg-gray-50 dark:bg-gray-700
            text-sm font-medium text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-600
            transition-colors
          "
          aria-label={`Switch to ${unit === SIZE_UNITS.MB ? 'KB' : 'MB'}`}
        >
          {unit}
        </button>
      </div>

      {/* Helper text */}
      <div className="space-y-1">
        {recommendedMin && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Recommended minimum: {recommendedMin} {unit} (20% of original)
          </p>
        )}
        {(error || localError) && (
          <p className="text-xs text-red-500" role="alert">
            {error || localError}
          </p>
        )}
      </div>
    </div>
  );
}
