import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss?: (id: string) => void;
  onCloseToast?: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
  onCloseToast,
}) => {
  const dismiss = onCloseToast || onDismiss || (() => {});
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 16, scale: 0.94 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8, scale: 0.96 }
              }
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3 ${
                isSuccess
                  ? 'bg-obsidian-950/95 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10'
                  : isError
                  ? 'bg-obsidian-950/95 border-red-500/40 text-red-300 shadow-red-500/10'
                  : toast.type === 'warning'
                  ? 'bg-obsidian-950/95 border-amber-500/40 text-amber-300 shadow-amber-500/10'
                  : 'bg-obsidian-950/95 border-teal-500/40 text-teal-300 shadow-teal-500/10'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isError ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : toast.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <Info className="w-5 h-5 text-teal-400" />
                )}
              </div>

              <div className="flex-1 space-y-0.5 pr-2">
                <div className="text-xs font-bold text-white">{toast.title}</div>
                {toast.message && (
                  <div className="text-[11px] text-slate-400 leading-relaxed font-normal">
                    {toast.message}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="text-slate-500 hover:text-white transition p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export const ToastContainer = ToastNotification;

