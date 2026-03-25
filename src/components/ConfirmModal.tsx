import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Да, сбросить' }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 10 }} 
            className="relative glass-panel p-6 max-w-[340px] w-full"
          >
            <h3 className="text-xl font-extrabold mb-2 text-white">{title}</h3>
            <p className="text-slate-300 text-[14px] leading-relaxed mb-6">{message}</p>
            <div className="flex gap-3">
              <button 
                onClick={onCancel}
                className="flex-1 glass-button text-white font-bold py-3 text-[13px] uppercase tracking-wide"
              >
                Отмена
              </button>
              <button 
                onClick={onConfirm}
                className="flex-1 bg-brand-red/80 hover:bg-brand-red backdrop-blur-md border border-brand-red/50 text-white font-bold py-3 rounded-2xl transition-colors text-[13px] uppercase tracking-wide"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
