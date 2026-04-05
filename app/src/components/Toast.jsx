import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
};

/**
 * Toast notification component
 * @param {Object} props
 * @param {string} props.message - Toast message
 * @param {string} props.type - Toast type
 * @param {Function} props.onClose - Close handler
 */
export function Toast({ message, type = 'info', onClose }) {
  const Icon = icons[type] || Info;

  useEffect(() => {
    // Auto-dismiss is handled by useToast hook
    return () => {};
  }, []);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-fade-in min-w-[280px] max-w-md ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Toast container component
 * @param {Object} props
 * @param {Array} props.toasts - Array of toast objects
 * @param {Function} props.onRemove - Remove toast handler
 */
export function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}
