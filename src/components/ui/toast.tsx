'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, title: string, description?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setMessages((prev) => [...prev, { id, type, title, description, duration }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const success = useCallback((title: string, description?: string) => toast('success', title, description), [toast]);
  const error = useCallback((title: string, description?: string) => toast('error', title, description), [toast]);
  const warning = useCallback((title: string, description?: string) => toast('warning', title, description), [toast]);
  const info = useCallback((title: string, description?: string) => toast('info', title, description), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      
      {/* Toast container overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {messages.map((msg) => {
          const icons = {
            success: <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-brand-red shrink-0" />,
            info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
          };

          const borders = {
            success: 'border-l-green-500',
            warning: 'border-l-yellow-500',
            error: 'border-l-brand-red',
            info: 'border-l-blue-500',
          };

          return (
            <div
              key={msg.id}
              className={`pointer-events-auto flex items-start gap-3 bg-brand-card text-white border border-brand-grey/15 border-l-4 ${borders[msg.type]} p-4 shadow-2xl transition-all duration-300 animate-slide-in font-sans`}
            >
              {icons[msg.type]}
              <div className="flex-1">
                <h4 className="font-bold text-sm leading-tight">{msg.title}</h4>
                {msg.description && (
                  <p className="text-xs text-brand-grey mt-1">{msg.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(msg.id)}
                className="text-brand-grey hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
