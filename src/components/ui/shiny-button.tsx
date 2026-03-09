"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ShinyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const ShinyButton = forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "relative overflow-hidden rounded-xl px-4 py-2",
          "bg-gradient-to-b from-white/20 to-white/5",
          "border border-white/20",
          "text-white font-medium text-sm",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_1px_0_rgba(255,255,255,0.1)]",
          "backdrop-blur-sm",
          "transition-colors duration-200",
          "before:absolute before:inset-0 before:-translate-x-full",
          "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
          "hover:before:translate-x-full before:transition-transform before:duration-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
          className
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {children}
      </motion.button>
    );
  }
);
ShinyButton.displayName = "ShinyButton";
