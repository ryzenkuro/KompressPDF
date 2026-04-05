import React from 'react';
import { QUALITY_PRESETS } from '../utils/constants.js';

/**
 * Quality selector component
 * @param {Object} props
 * @param {string} props.value - Selected quality (HIGH, MEDIUM, LOW)
 * @param {Function} props.onChange - Change handler
 */
export function QualitySelector({ value, onChange }) {
  const options = [
    { key: 'HIGH', ...QUALITY_PRESETS.HIGH },
    { key: 'MEDIUM', ...QUALITY_PRESETS.MEDIUM },
    { key: 'LOW', ...QUALITY_PRESETS.LOW },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Image Quality
      </label>
      
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={`
              relative p-3 rounded-lg border-2 transition-all duration-200 text-left
              ${value === option.key
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            aria-pressed={value === option.key}
            aria-label={`Select ${option.name} quality: ${option.description}`}
          >
            <div className="space-y-1">
              <span className={`
                block text-sm font-semibold
                ${value === option.key
                  ? 'text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300'
                }
              `}>
                {option.name}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                {option.quality * 100}%
              </span>
            </div>

            {/* Quality indicator */}
            <div className="mt-2 flex gap-0.5">
              {[1, 2, 3].map((dot) => (
                <div
                  key={dot}
                  className={`
                    w-2 h-2 rounded-full
                    ${value === option.key
                      ? 'bg-indigo-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                    }
                    ${option.key === 'HIGH' && dot <= 3 ? 'opacity-100' : ''}
                    ${option.key === 'MEDIUM' && dot <= 2 ? 'opacity-100' : 'opacity-40'}
                    ${option.key === 'LOW' && dot <= 1 ? 'opacity-100' : 'opacity-40'}
                  `}
                />
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {options.find(o => o.key === value)?.description}
      </p>
    </div>
  );
}
