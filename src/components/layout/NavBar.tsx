"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Home, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_COLS = 12;

interface NavCell {
  col: number;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  action?: () => void;
}

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const navCells: NavCell[] = [
    {
      col: 1,
      label: "AAC",
      icon: <Home className="w-5 h-5" />,
      href: "/aac",
    },
    {
      col: 2,
      label: "Calendar",
      icon: <Calendar className="w-5 h-5" />,
      href: "/calendar",
    },
  ];

  const cells: NavCell[] = Array.from({ length: NAV_COLS }, (_, i) => {
    const col = i + 1;
    return navCells.find((n) => n.col === col) ?? { col, label: `B1:${col}` };
  });

  return (
    <div
      className="grid w-full"
      style={{
        gridTemplateColumns: `repeat(${NAV_COLS}, minmax(0, 1fr))`,
        height: "var(--nav-height)",
      }}
    >
      {cells.map((cell) => {
        const isActive = "href" in cell && cell.href && pathname === cell.href;
        const hasAction = "href" in cell && cell.href;

        return (
          <motion.button
            key={cell.col}
            whileHover={hasAction ? { scale: 1.05 } : {}}
            whileTap={hasAction ? { scale: 0.95 } : {}}
            onClick={() => {
              if ("action" in cell && cell.action) {
                cell.action();
              } else if ("href" in cell && cell.href) {
                if (cell.href === "/calendar" && pathname === "/calendar") {
                  // Already on calendar — scroll back to today
                  window.dispatchEvent(new CustomEvent("calendar:scrollToToday"));
                } else {
                  router.push(cell.href);
                }
              }
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 h-full",
              "border-r border-b border-white/10 last:border-r-0",
              "text-xs font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-blue-400",
              isActive
                ? "bg-blue-600/30 text-white border-b-2 border-b-blue-400"
                : hasAction
                ? "bg-slate-800/60 hover:bg-slate-700/60 text-white/90 cursor-pointer"
                : "bg-slate-900/40 text-white/30 cursor-default"
            )}
          >
            {"icon" in cell && cell.icon && (
              <span className="opacity-80">{cell.icon}</span>
            )}
            <span className="truncate px-1">{cell.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
