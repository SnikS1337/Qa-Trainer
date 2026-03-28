import { ReactNode, useEffect } from 'react';
import { motion } from 'motion/react';
import { createPortal } from 'react-dom';

type ModalSize = 'compact' | 'default' | 'wide';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlay?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  compact: 'max-w-md',
  default: 'max-w-lg',
  wide: 'max-w-2xl',
};

export default function ModalShell({
  isOpen,
  onClose,
  children,
  size = 'default',
  showCloseButton = false,
  closeOnOverlay = true,
}: ModalShellProps) {
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/68 backdrop-blur-lg"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className={`relative z-[111] w-full ${sizeClasses[size]}`}
      >
        <div className="glass-panel relative p-6 backdrop-blur-xl">
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl transition-colors"
            >
              ✕
            </button>
          )}
          {children}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
