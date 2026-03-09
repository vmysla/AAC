"use client";

import { useState } from "react";
import { NavBar } from "@/components/layout/NavBar";
import { AACGrid } from "@/components/aac/AACGrid";
import { AACButtonEntry } from "@/data/aacButtons";
import { motion, AnimatePresence } from "motion/react";

export function AACScreen() {
  const [spoken, setSpoken] = useState<AACButtonEntry[]>([]);

  function handleButtonPress(button: AACButtonEntry) {
    setSpoken((prev) => [...prev.slice(-8), button]);
    // Save to recent buttons for First-Then screen
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("aac:recentButtons");
        const recent: AACButtonEntry[] = stored ? JSON.parse(stored) : [];
        const deduped = [button, ...recent.filter((r) => r.label !== button.label)].slice(0, 12);
        localStorage.setItem("aac:recentButtons", JSON.stringify(deduped));
      } catch {
        // ignore localStorage errors
      }
    }
    // Text-to-speech
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(button.label);
      utt.rate = 0.9;
      window.speechSynthesis.speak(utt);
    }
  }

  function clearSpoken() {
    setSpoken([]);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Navigation row */}
      <NavBar />

      {/* Sentence bar */}
      <div className="flex items-center gap-2 px-2 py-1 bg-slate-900/60 border-b border-white/5 min-h-[2.5rem]">
        <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none">
          <AnimatePresence>
            {spoken.map((btn, i) => (
              <motion.span
                key={`${btn.label}-${i}`}
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-sm text-white/80 bg-white/10 rounded-lg px-2 py-0.5 whitespace-nowrap shrink-0"
              >
                {btn.label}
              </motion.span>
            ))}
          </AnimatePresence>
          {spoken.length === 0 && (
            <span className="text-xs text-white/20 italic">Tap buttons to build a sentence...</span>
          )}
        </div>
        {spoken.length > 0 && (
          <button
            onClick={clearSpoken}
            className="text-xs text-white/30 hover:text-white/70 transition px-2 py-1 rounded hover:bg-white/10 shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {/* AAC Grid */}
      <AACGrid onButtonPress={handleButtonPress} />
    </div>
  );
}
