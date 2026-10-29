import React, { useEffect } from 'react';
import { Check, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div 
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-lg shadow-xl border border-stone-800 dark:border-stone-200 transition-all duration-200 text-sm max-w-sm"
    >
      {toast.type === 'success' ? (
        <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
      ) : (
        <Info className="w-4 h-4 text-amber-400 dark:text-amber-600 shrink-0" />
      )}
      <span className="flex-1 font-medium">{toast.text}</span>
      <button 
        onClick={onClose} 
        aria-label="Close notification"
        className="text-stone-400 hover:text-stone-200 dark:hover:text-stone-700 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
