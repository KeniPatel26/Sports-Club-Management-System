import React, { createContext, useContext, useState, useCallback } from 'react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ title = '', message = '', type = 'info', duration = 4000 }) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast = { id, title, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toastSuccess = useCallback((message, title = 'Success') => {
    return showToast({ title, message, type: 'success' });
  }, [showToast]);

  const toastError = useCallback((message, title = 'Error') => {
    return showToast({ title, message, type: 'danger' });
  }, [showToast]);

  const toastWarning = useCallback((message, title = 'Warning') => {
    return showToast({ title, message, type: 'warning' });
  }, [showToast]);

  const toastInfo = useCallback((message, title = 'Info') => {
    return showToast({ title, message, type: 'info' });
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        toastSuccess,
        toastError,
        toastWarning,
        toastInfo,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
