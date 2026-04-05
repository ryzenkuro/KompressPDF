import { useState, useCallback, useRef, useEffect } from 'react';
import { TOAST_DURATION } from '../utils/constants.js';

/**
 * Hook for managing toast notifications
 * @returns {Object} Toast state and controls
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  /**
   * Add a new toast
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {number} duration - Duration in ms
   * @returns {string} Toast ID
   */
  const addToast = useCallback((message, type = 'info', duration = TOAST_DURATION) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss
    const timeout = setTimeout(() => {
      removeToast(id);
    }, duration);

    timeoutsRef.current.set(id, timeout);

    return id;
  }, []);

  /**
   * Remove a toast by ID
   * @param {string} id - Toast ID
   */
  const removeToast = useCallback((id) => {
    // Clear timeout
    if (timeoutsRef.current.has(id)) {
      clearTimeout(timeoutsRef.current.get(id));
      timeoutsRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Show success toast
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms
   */
  const success = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  /**
   * Show error toast
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms
   */
  const error = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  /**
   * Show warning toast
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms
   */
  const warning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  /**
   * Show info toast
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms
   */
  const info = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  /**
   * Clear all toasts
   */
  const clearAll = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
    setToasts([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clearAll,
  };
}
