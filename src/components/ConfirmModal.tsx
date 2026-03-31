import ModalShell from './ModalShell';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Да, сбросить',
}: ConfirmModalProps) {
  return (
    <ModalShell isOpen={isOpen} onClose={onCancel} size="compact">
      <h3 className="mb-2 text-xl font-extrabold text-white">{title}</h3>
      <p className="mb-6 text-[14px] leading-relaxed text-slate-300">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="glass-button flex-1 py-3 text-[13px] font-bold tracking-wide text-white uppercase"
        >
          Отмена
        </button>
        <button
          onClick={onConfirm}
          className="bg-brand-red/80 hover:bg-brand-red border-brand-red/50 flex-1 rounded-2xl border py-3 text-[13px] font-bold tracking-wide text-white uppercase backdrop-blur-md transition-colors"
        >
          {confirmText}
        </button>
      </div>
    </ModalShell>
  );
}
