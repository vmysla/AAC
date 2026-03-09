"use client";

import { useState, useEffect, useMemo } from "react";
import { NavBar } from "@/components/layout/NavBar";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { DEFAULT_BUTTONS, AACButtonEntry } from "@/data/aacButtons";
import * as LucideIcons from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PickedItem {
  label: string;
  iconName?: string;
  color?: string;
}

type Phase =
  | { step: "select-then" }
  | { step: "select-first-mode"; thenItem: PickedItem }
  | { step: "select-wait"; thenItem: PickedItem }
  | { step: "select-task-item"; thenItem: PickedItem }
  | { step: "select-task-count"; thenItem: PickedItem; firstItem: PickedItem }
  | { step: "active-wait"; thenItem: PickedItem; totalSeconds: number; remainingSeconds: number }
  | { step: "active-task"; thenItem: PickedItem; firstItem: PickedItem; totalCount: number; completedCount: number }
  | { step: "celebrating"; thenItem: PickedItem };

const WAIT_OPTIONS = [
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "20 min", seconds: 1200 },
  { label: "30 min", seconds: 1800 },
  { label: "1 hr", seconds: 3600 },
];

const COUNT_OPTIONS = [1, 2, 3, 5, 7, 10];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRecentButtons(): PickedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("aac:recentButtons");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function formatTime(s: number): string {
  if (s >= 3600) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${Math.floor(s / 60)} min`;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function ItemIcon({ iconName, size = "md" }: { iconName?: string; size?: "xs" | "sm" | "md" | "lg" | "xl" }) {
  const Icon = iconName
    ? (LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType | undefined)
    : null;
  const cls = { xs: "w-4 h-4", sm: "w-6 h-6", md: "w-9 h-9", lg: "w-14 h-14", xl: "w-20 h-20" }[size];
  if (!Icon) return <span className={cn(cls, "flex items-center justify-center text-white/30 text-lg")}>?</span>;
  return <Icon className={cn(cls, "text-white")} />;
}

function ButtonGrid({
  items,
  onSelect,
}: {
  items: PickedItem[];
  onSelect: (item: PickedItem) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 overflow-y-auto flex-1 content-start">
      {items.map((item, i) => (
        <motion.button
          key={`${item.label}-${i}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => onSelect(item)}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 aspect-square transition-colors"
        >
          <ItemIcon iconName={item.iconName} size="md" />
          <span className="text-xs font-semibold text-white/80 leading-tight text-center line-clamp-2">{item.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Phase 1: Select THEN ─────────────────────────────────────────────────────

function SelectThen({ onSelect }: { onSelect: (item: PickedItem) => void }) {
  const [showAll, setShowAll] = useState(false);
  const recent = getRecentButtons();
  const allItems: PickedItem[] = DEFAULT_BUTTONS.map((b) => ({
    label: b.label,
    iconName: b.iconName,
    color: b.color,
  }));
  const items = showAll ? allItems : recent;

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <div className="text-center shrink-0">
        <h2 className="text-xl font-bold text-white">What do you want?</h2>
        <p className="text-sm text-white/40 mt-0.5">Tap the item you are asking for</p>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <LucideIcons.MousePointerClick className="w-10 h-10 text-white/20" />
          <p className="text-white/40 text-sm text-center">No recent buttons yet — use the AAC screen first, or browse all</p>
          <button onClick={() => setShowAll(true)} className="text-blue-400 text-sm font-semibold underline">
            Browse all buttons
          </button>
        </div>
      ) : (
        <ButtonGrid items={items} onSelect={onSelect} />
      )}

      {!showAll && recent.length > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="shrink-0 text-center text-blue-400/80 text-sm hover:text-blue-400 transition-colors"
        >
          Browse all buttons
        </button>
      )}
      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="shrink-0 text-center text-white/40 text-sm hover:text-white/60 transition-colors"
        >
          Show recent only
        </button>
      )}
    </div>
  );
}

// ─── Phase 2: Select FIRST mode ───────────────────────────────────────────────

function SelectFirstMode({
  thenItem,
  onWait,
  onTask,
}: {
  thenItem: PickedItem;
  onWait: () => void;
  onTask: () => void;
}) {
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="text-center shrink-0">
        <p className="text-sm text-white/40">Before you get...</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <ItemIcon iconName={thenItem.iconName} size="sm" />
          <h2 className="text-xl font-bold text-white">{thenItem.label}</h2>
        </div>
        <p className="text-base text-white/60 mt-2">...first you need to:</p>
      </div>

      <div className="flex-1 flex gap-4 items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={onWait}
          className="flex-1 max-w-xs flex flex-col items-center justify-center gap-4 rounded-2xl bg-amber-500/15 border-2 border-amber-400/40 hover:bg-amber-500/25 p-8 aspect-square transition-colors"
        >
          <LucideIcons.Clock className="w-16 h-16 text-amber-300" />
          <span className="text-xl font-bold text-amber-200">Wait</span>
          <span className="text-xs text-amber-300/60 text-center">Wait a set amount of time</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={onTask}
          className="flex-1 max-w-xs flex flex-col items-center justify-center gap-4 rounded-2xl bg-purple-500/15 border-2 border-purple-400/40 hover:bg-purple-500/25 p-8 aspect-square transition-colors"
        >
          <LucideIcons.ListChecks className="w-16 h-16 text-purple-300" />
          <span className="text-xl font-bold text-purple-200">Do a task</span>
          <span className="text-xs text-purple-300/60 text-center">Complete something a number of times</span>
        </motion.button>
      </div>
    </div>
  );
}

// ─── Phase 3a: Select wait time ───────────────────────────────────────────────

function SelectWait({
  thenItem,
  onConfirm,
}: {
  thenItem: PickedItem;
  onConfirm: (seconds: number) => void;
}) {
  const [seconds, setSeconds] = useState(300);

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <div className="text-center shrink-0">
        <p className="text-sm text-white/40">How long to wait before</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <ItemIcon iconName={thenItem.iconName} size="sm" />
          <h2 className="text-xl font-bold text-white">{thenItem.label}</h2>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 shrink-0">
        {WAIT_OPTIONS.map((opt) => (
          <motion.button
            key={opt.seconds}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSeconds(opt.seconds)}
            className={cn(
              "py-3 rounded-xl font-bold text-sm transition-all",
              seconds === opt.seconds
                ? "bg-amber-500/50 border-2 border-amber-400 text-amber-100"
                : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
            )}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>

      {/* Custom adjuster */}
      <div className="flex items-center justify-center gap-6 bg-white/5 rounded-2xl p-4 border border-white/10 shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setSeconds((s) => Math.max(60, s - 60))}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl font-bold transition-colors"
        >
          −
        </motion.button>
        <span className="text-2xl font-bold text-white min-w-[7rem] text-center">{formatTime(seconds)}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setSeconds((s) => s + 60)}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl font-bold transition-colors"
        >
          +
        </motion.button>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onConfirm(seconds)}
        className="mt-auto py-4 rounded-2xl bg-amber-500/50 hover:bg-amber-500/70 border-2 border-amber-400/60 text-white text-lg font-bold transition-all shrink-0"
      >
        Start {formatTime(seconds)} timer →
      </motion.button>
    </div>
  );
}

// ─── Phase 3b: Select task item ───────────────────────────────────────────────

function SelectTaskItem({
  thenItem,
  onSelect,
}: {
  thenItem: PickedItem;
  onSelect: (item: PickedItem) => void;
}) {
  const items: PickedItem[] = DEFAULT_BUTTONS.map((b) => ({
    label: b.label,
    iconName: b.iconName,
    color: b.color,
  }));

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <div className="text-center shrink-0">
        <p className="text-sm text-white/40">What must happen first before</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <ItemIcon iconName={thenItem.iconName} size="sm" />
          <h2 className="text-xl font-bold text-white">{thenItem.label}</h2>
        </div>
      </div>
      <ButtonGrid items={items} onSelect={onSelect} />
    </div>
  );
}

// ─── Phase 4b: Select token count ─────────────────────────────────────────────

function SelectTaskCount({
  thenItem,
  firstItem,
  onConfirm,
}: {
  thenItem: PickedItem;
  firstItem: PickedItem;
  onConfirm: (count: number) => void;
}) {
  const [count, setCount] = useState(5);

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="text-center shrink-0">
        <p className="text-sm text-white/40">How many times</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <ItemIcon iconName={firstItem.iconName} size="sm" />
          <h2 className="text-xl font-bold text-white">{firstItem.label}</h2>
        </div>
        <p className="text-sm text-white/40 mt-1">before getting</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <ItemIcon iconName={thenItem.iconName} size="sm" />
          <span className="text-lg font-bold text-white">{thenItem.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 shrink-0">
        {COUNT_OPTIONS.map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCount(n)}
            className={cn(
              "py-4 rounded-xl font-bold text-xl transition-all",
              count === n
                ? "bg-purple-500/50 border-2 border-purple-400 text-purple-100"
                : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
            )}
          >
            {n}×
          </motion.button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 bg-white/5 rounded-2xl p-4 border border-white/10 shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCount((c) => Math.max(1, c - 1))}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl font-bold transition-colors"
        >
          −
        </motion.button>
        <span className="text-3xl font-bold text-white min-w-[4rem] text-center">{count}×</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCount((c) => c + 1)}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl font-bold transition-colors"
        >
          +
        </motion.button>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onConfirm(count)}
        className="mt-auto py-4 rounded-2xl bg-purple-500/50 hover:bg-purple-500/70 border-2 border-purple-400/60 text-white text-lg font-bold transition-all shrink-0"
      >
        Start — {count}× {firstItem.label} →
      </motion.button>
    </div>
  );
}

// ─── Active: Wait (countdown timer) ──────────────────────────────────────────

function ActiveWait({
  thenItem,
  totalSeconds,
  remainingSeconds,
}: {
  thenItem: PickedItem;
  totalSeconds: number;
  remainingSeconds: number;
}) {
  const progress = 1 - remainingSeconds / totalSeconds;
  const R = 80;
  const circ = 2 * Math.PI * R;
  const remaining_m = Math.floor(remainingSeconds / 60);
  const remaining_s = remainingSeconds % 60;

  return (
    <div className="flex h-full p-4 gap-4">
      {/* FIRST */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-amber-400/40 bg-amber-500/10 p-6">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400/70">FIRST</span>
        <div className="relative">
          <svg width="200" height="200" className="-rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="12" />
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="rgb(251,191,36)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * progress}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <LucideIcons.Clock className="w-8 h-8 text-amber-300/60 mb-1" />
            <span className="text-3xl font-bold text-amber-200 tabular-nums">
              {remaining_m}:{remaining_s.toString().padStart(2, "0")}
            </span>
            <span className="text-xs text-amber-300/50">remaining</span>
          </div>
        </div>
        <span className="text-white/40 text-sm">Waiting...</span>
      </div>

      {/* THEN */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-blue-400/30 bg-blue-500/5 p-6 opacity-50">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-400/70">THEN</span>
        <ItemIcon iconName={thenItem.iconName} size="xl" />
        <span className="text-xl font-bold text-white">{thenItem.label}</span>
      </div>
    </div>
  );
}

// ─── Active: Task (token tapping) ────────────────────────────────────────────

function ActiveTask({
  thenItem,
  firstItem,
  totalCount,
  completedCount,
  onTap,
}: {
  thenItem: PickedItem;
  firstItem: PickedItem;
  totalCount: number;
  completedCount: number;
  onTap: () => void;
}) {
  const remaining = totalCount - completedCount;
  const done = remaining === 0;

  return (
    <div className="flex h-full p-4 gap-4">
      {/* FIRST */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-purple-400/40 bg-purple-500/10 p-4">
        <span className="text-xs font-bold uppercase tracking-widest text-purple-400/70">FIRST</span>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onTap}
          disabled={done}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-8 transition-all",
            done
              ? "border-white/10 bg-white/5 cursor-default opacity-40"
              : "border-purple-400/60 bg-purple-500/30 hover:bg-purple-500/50 active:bg-purple-500/70 cursor-pointer"
          )}
        >
          <ItemIcon iconName={firstItem.iconName} size="xl" />
          <span className="text-xl font-bold text-white">{firstItem.label}</span>
          {!done && <span className="text-xs text-purple-300/70">Tap to confirm</span>}
        </motion.button>

        {/* Token dots */}
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({ length: totalCount }, (_, i) => (
            <motion.div
              key={i}
              animate={
                i < completedCount
                  ? { scale: [1, 1.35, 1], backgroundColor: ["#a78bfa", "#a78bfa"] }
                  : {}
              }
              className={cn(
                "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors",
                i < completedCount
                  ? "bg-purple-400 border-purple-300"
                  : "bg-white/5 border-white/20"
              )}
            >
              {i < completedCount && <LucideIcons.Check className="w-4 h-4 text-white" />}
            </motion.div>
          ))}
        </div>

        {!done && (
          <span className="text-white/50 text-sm">
            {remaining} more time{remaining !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* THEN */}
      <div
        className={cn(
          "flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 p-6 transition-all duration-500",
          done
            ? "border-green-400/60 bg-green-500/15"
            : "border-blue-400/30 bg-blue-500/5 opacity-50"
        )}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-blue-400/70">THEN</span>
        <ItemIcon iconName={thenItem.iconName} size="xl" />
        <span className="text-xl font-bold text-white">{thenItem.label}</span>
      </div>
    </div>
  );
}

// ─── Celebration overlay ──────────────────────────────────────────────────────

function Celebration({ item, onDone }: { item: PickedItem; onDone: () => void }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const angle = (i / 30) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
        const distance = 120 + Math.random() * 220;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 8 + Math.random() * 14,
          color: ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"][i % 6],
          delay: Math.random() * 0.4,
          rotation: Math.random() * 720 - 360,
        };
      }),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/96 z-50 overflow-hidden"
    >
      {/* Burst particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{ x: p.x, y: p.y, scale: [0, 1.4, 1], opacity: [1, 1, 0], rotate: p.rotation }}
            transition={{ duration: 1.8, delay: p.delay, ease: "easeOut" }}
            className="absolute rounded-sm"
            style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          />
        ))}
      </div>

      {/* Main card */}
      <motion.div
        initial={{ scale: 0.4, rotate: -15, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.15 }}
        className="flex flex-col items-center gap-6 z-10"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="flex flex-col items-center gap-4 bg-white/10 rounded-3xl px-14 py-10 border-2 border-white/20 shadow-2xl"
        >
          <ItemIcon iconName={item.iconName} size="xl" />
          <span className="text-4xl font-black text-white">{item.label}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 text-yellow-300"
        >
          <LucideIcons.Sparkles className="w-7 h-7" />
          <span className="text-3xl font-black">You earned it!</span>
          <LucideIcons.Sparkles className="w-7 h-7" />
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileTap={{ scale: 0.96 }}
          onClick={onDone}
          className="mt-2 px-10 py-4 rounded-2xl bg-white/15 hover:bg-white/25 border-2 border-white/25 text-white text-xl font-bold transition-all"
        >
          Done
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Back button ──────────────────────────────────────────────────────────────

function BackButton({ phase, onBack }: { phase: Phase; onBack: () => void }) {
  if (phase.step === "select-then" || phase.step === "celebrating") return null;
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onBack}
      className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white/70 text-sm transition-all z-10"
    >
      ← Back
    </motion.button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FirstThenScreen() {
  const [phase, setPhase] = useState<Phase>({ step: "select-then" });

  // Countdown tick for active-wait
  useEffect(() => {
    if (phase.step !== "active-wait") return;
    if (phase.remainingSeconds <= 0) {
      setPhase({ step: "celebrating", thenItem: phase.thenItem });
      return;
    }
    const id = setTimeout(() => {
      setPhase((prev) =>
        prev.step === "active-wait" ? { ...prev, remainingSeconds: prev.remainingSeconds - 1 } : prev
      );
    }, 1000);
    return () => clearTimeout(id);
  }, [phase]);

  const reset = () => setPhase({ step: "select-then" });

  function handleBack() {
    switch (phase.step) {
      case "select-first-mode":
        setPhase({ step: "select-then" });
        break;
      case "select-wait":
      case "select-task-item":
        setPhase({ step: "select-first-mode", thenItem: phase.thenItem });
        break;
      case "select-task-count":
        setPhase({ step: "select-task-item", thenItem: phase.thenItem });
        break;
      case "active-wait":
      case "active-task":
        reset();
        break;
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden">
      <NavBar />

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {phase.step === "select-then" && (
            <motion.div key="select-then" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }} className="absolute inset-0">
              <SelectThen
                onSelect={(item) => setPhase({ step: "select-first-mode", thenItem: item })}
              />
            </motion.div>
          )}

          {phase.step === "select-first-mode" && (
            <motion.div key="select-mode" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }} className="absolute inset-0">
              <SelectFirstMode
                thenItem={phase.thenItem}
                onWait={() => setPhase({ step: "select-wait", thenItem: phase.thenItem })}
                onTask={() => setPhase({ step: "select-task-item", thenItem: phase.thenItem })}
              />
            </motion.div>
          )}

          {phase.step === "select-wait" && (
            <motion.div key="select-wait" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }} className="absolute inset-0">
              <SelectWait
                thenItem={phase.thenItem}
                onConfirm={(seconds) =>
                  setPhase({ step: "active-wait", thenItem: phase.thenItem, totalSeconds: seconds, remainingSeconds: seconds })
                }
              />
            </motion.div>
          )}

          {phase.step === "select-task-item" && (
            <motion.div key="select-task-item" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }} className="absolute inset-0">
              <SelectTaskItem
                thenItem={phase.thenItem}
                onSelect={(firstItem) =>
                  setPhase({ step: "select-task-count", thenItem: phase.thenItem, firstItem })
                }
              />
            </motion.div>
          )}

          {phase.step === "select-task-count" && (
            <motion.div key="select-count" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }} className="absolute inset-0">
              <SelectTaskCount
                thenItem={phase.thenItem}
                firstItem={phase.firstItem}
                onConfirm={(count) =>
                  setPhase({ step: "active-task", thenItem: phase.thenItem, firstItem: phase.firstItem, totalCount: count, completedCount: 0 })
                }
              />
            </motion.div>
          )}

          {phase.step === "active-wait" && (
            <motion.div key="active-wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <ActiveWait
                thenItem={phase.thenItem}
                totalSeconds={phase.totalSeconds}
                remainingSeconds={phase.remainingSeconds}
              />
            </motion.div>
          )}

          {phase.step === "active-task" && (
            <motion.div key="active-task" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <ActiveTask
                thenItem={phase.thenItem}
                firstItem={phase.firstItem}
                totalCount={phase.totalCount}
                completedCount={phase.completedCount}
                onTap={() => {
                  if (phase.step !== "active-task") return;
                  const next = phase.completedCount + 1;
                  if (next >= phase.totalCount) {
                    setPhase({ step: "celebrating", thenItem: phase.thenItem });
                  } else {
                    setPhase({ ...phase, completedCount: next });
                  }
                }}
              />
            </motion.div>
          )}

          {phase.step === "celebrating" && (
            <Celebration key="celebrating" item={phase.thenItem} onDone={reset} />
          )}
        </AnimatePresence>

        <BackButton phase={phase} onBack={handleBack} />
      </div>
    </div>
  );
}
