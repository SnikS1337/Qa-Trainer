import * as React from "react";
import { motion, AnimatePresence } from 'motion/react';

interface ToastNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: "success" | "error" | "warning" | "info";
}

const ToastNotification = React.forwardRef<HTMLDivElement, ToastNotificationProps>(
  ({ message, isVisible, onClose, type = "info" }, ref) => {
    const typeStyles = {
      success: "bg-green-500/80 border-green-500/50 text-white",
      error: "bg-red-500/80 border-red-500/50 text-white",
      warning: "bg-amber-500/80 border-amber-500/50 text-white",
      info: "bg-blue-500/80 border-blue-500/50 text-white",
    };

    React.useEffect(() => {
      if (isVisible) {
        const timer = setTimeout(onClose, 3000); // Автоматическое скрытие через 3 секунды
        return () => clearTimeout(timer);
      }
    }, [isVisible, onClose]);

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className={`fixed top-4 right-4 z-[100] px-4 py-2 rounded-lg border backdrop-blur-md max-w-md ${typeStyles[type]}`}
          >
            <div className="flex items-center gap-2">
              <span>{message}</span>
              <button
                onClick={onClose}
                className="ml-2 text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

ToastNotification.displayName = "ToastNotification";

export { ToastNotification };