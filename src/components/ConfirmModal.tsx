import ModalShell from './ModalShell';

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
    <ModalShell isOpen={isOpen} onClose={onCancel} size="compact">
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
    </ModalShell>
  );
}
