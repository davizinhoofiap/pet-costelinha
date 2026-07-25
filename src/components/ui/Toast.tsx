'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const styles = {
    success: 'bg-emerald-900/90 text-emerald-100 border-emerald-700/60',
    error: 'bg-rose-900/90 text-rose-100 border-rose-700/60',
    info: 'bg-slate-900/90 text-slate-100 border-slate-700/60',
  }[type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 duration-200 ${styles}`}
    >
      <Icon className="w-4 h-4 shrink-0 stroke-[1.75]" />
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="p-1 hover:opacity-75 transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
