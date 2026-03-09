"use client";

import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

interface AACButtonProps {
  row: number;
  col: number;
  label: string;
  iconName?: string;
  color?: string;
  onClick?: () => void;
  className?: string;
}

const BUTTON_COLORS = [
  "bg-blue-600/30 border-blue-500/40 hover:bg-blue-500/50",
  "bg-green-600/30 border-green-500/40 hover:bg-green-500/50",
  "bg-purple-600/30 border-purple-500/40 hover:bg-purple-500/50",
  "bg-orange-600/30 border-orange-500/40 hover:bg-orange-500/50",
  "bg-pink-600/30 border-pink-500/40 hover:bg-pink-500/50",
  "bg-teal-600/30 border-teal-500/40 hover:bg-teal-500/50",
];

export function AACButton({
  row,
  col,
  label,
  iconName,
  color,
  onClick,
  className,
}: AACButtonProps) {
  const colorClass = color ?? BUTTON_COLORS[((row - 1) * 12 + (col - 1)) % BUTTON_COLORS.length];

  // Dynamically get the icon from lucide-react
  const IconComponent = iconName
    ? (Icons[iconName as keyof typeof Icons] as LucideIcon | undefined)
    : null;

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      title={`B${row}:${col} — ${label}`}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1",
        "w-full h-full rounded-xl border",
        "text-white backdrop-blur-sm",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        "overflow-hidden group",
        colorClass,
        className
      )}
    >
      {/* Spotlight shimmer on hover */}
      <motion.div
        className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 70%)",
        }}
      />

      {IconComponent && (
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10"
          >
            <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
          </motion.div>
        </AnimatePresence>
      )}

      <span className="relative z-10 text-[clamp(0.55rem,1.2vw,0.85rem)] font-semibold text-center leading-tight px-1 line-clamp-2">
        {label}
      </span>

      {/* Button ID badge (dev helper, subtle) */}
      <span className="absolute bottom-0.5 right-1 text-[0.5rem] text-white/20 select-none">
        B{row}:{col}
      </span>
    </motion.button>
  );
}
