"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface ProfileCardProps {
  name: string;
  image?: string | null;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
}

export function ProfileCard({
  name,
  image,
  onClick,
  className,
  selected = false,
}: ProfileCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-6 rounded-2xl",
        "border-2 transition-all duration-200",
        "bg-white/5 backdrop-blur-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
        selected
          ? "border-blue-400 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          : "border-white/10 hover:border-white/30",
        className
      )}
    >
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover" />
        ) : (
          <User className="w-10 h-10 text-white/60" />
        )}
      </div>
      <span className="text-white font-semibold text-lg">{name}</span>
    </motion.button>
  );
}
