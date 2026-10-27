import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useI18n } from '../../i18n/context';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isDestructive = true,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  const { t } = useI18n();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4 p-6">
          <div
            className={`p-3 rounded-full shrink-0 ${
              isDestructive ? 'bg-[#e76f51]/10 text-[#e76f51]' : 'bg-[#e9c46a]/20 text-[#b78917]'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 id="confirm-dialog-title" className="text-lg font-bold text-[#1d2d35] leading-tight mb-1">
              {title}
            </h3>
            <p className="text-sm text-[#62727b] leading-relaxed">
              {description}
            </p>
            {children && <div className="mt-4">{children}</div>}
          </div>
          <button
            onClick={onCancel}
            aria-label={t('close')}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          >
            {cancelLabel || t('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
              isDestructive
                ? 'bg-[#e76f51] hover:bg-[#d45e42] focus:ring-[#e76f51]'
                : 'bg-[#2a9d8f] hover:bg-[#238277] focus:ring-[#2a9d8f]'
            }`}
          >
            {confirmLabel || t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
