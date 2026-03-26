import * as React from "react";
import { motion } from 'motion/react';
import { Button } from './ui/Button';

interface ConfettiButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  onConfetti?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  disabled?: boolean;
}

const ConfettiButton = React.forwardRef<HTMLButtonElement, ConfettiButtonProps>(
  ({ children, onClick, onConfetti, variant = "default", className = "", disabled = false, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled) {
        if (onConfetti) {
          onConfetti();
        }
        onClick();
      }
    };

    return (
      <motion.button
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
          variant === "default" ? "bg-primary text-primary-foreground hover:bg-primary/90" :
          variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" :
          variant === "outline" ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" :
          variant === "secondary" ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" :
          variant === "ghost" ? "hover:bg-accent hover:text-accent-foreground" :
          "text-primary underline-offset-4 hover:underline"
        } ${className}`}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        whileInView={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 0.5 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

ConfettiButton.displayName = "ConfettiButton";

export { ConfettiButton };