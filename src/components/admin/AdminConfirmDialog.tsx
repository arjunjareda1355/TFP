import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';

interface AdminConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const AdminConfirmDialog: React.FC<AdminConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="admin-confirm-dialog-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111110]/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        id="admin-confirm-dialog-content"
        className="w-full max-w-md bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xs flex items-center justify-center shrink-0 ${
              variant === 'danger'
                ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
                : variant === 'warning'
                ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                : 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
            }`}
          >
            {variant === 'danger' ? (
              <Trash2 className="w-5 h-5" />
            ) : variant === 'warning' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <h3
              id="confirm-dialog-title"
              className="font-serif-editorial text-lg font-bold text-[#111110] leading-tight"
            >
              {title}
            </h3>
            <p className="text-xs text-[#6E6A62] font-sans-editorial leading-relaxed">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-[#8E8A81] hover:text-[#111110] p-1 transition-colors disabled:opacity-40"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-2 border-t border-[#E8E5DF] flex items-center justify-end gap-2.5 font-mono-editorial text-xs">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-[#E8E5DF] hover:bg-[#F9F8F6] text-[#55524B] rounded-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xs font-bold uppercase tracking-wider text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
              variant === 'danger'
                ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                : variant === 'warning'
                ? 'bg-[#D97706] hover:bg-[#B45309]'
                : 'bg-[#111110] hover:bg-[#EA580C]'
            } disabled:opacity-50`}
          >
            {isLoading && (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
