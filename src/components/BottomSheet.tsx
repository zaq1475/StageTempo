import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto max-h-[85vh] bg-slate-900 border-t border-slate-700/80 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Drag handle & Header */}
        <div className="p-4 pb-2 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-2.5 self-center" />
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
