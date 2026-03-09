"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface MorphyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export const MorphyButton = forwardRef<HTMLButtonElement, MorphyButtonProps>(
  ({ children, className, color = "#3b82f6", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05, borderRadius: "1.25rem" }}
        whileTap={{ scale: 0.95 }}
        initial={{ borderRadius: "0.75rem" }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-1",
          "w-full h-full",
          "border border-white/20 bg-white/10 backdrop-blur-sm",
          "text-white font-medium",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
          "overflow-hidden",
          className
        )}
        style={{ backgroundColor: `${color}22` }}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        <motion.div
          className="absolute inset-0 opacity-0"
          style={{ background: `radial-gradient(circle, ${color}44 0%, transparent 70%)` }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }
);
MorphyButton.displayName = "MorphyButton";
