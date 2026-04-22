import { createContext, useContext } from 'react';
import { useToast as useToastHook } from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const toast = useToastHook();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
