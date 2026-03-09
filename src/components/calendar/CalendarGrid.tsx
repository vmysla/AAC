"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { ActivityData } from "@/types";
import * as LucideIcons from "lucide-react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const VISIBLE_WEEKS = 3;   // controls row height so ~3 weeks fit the screen
const MAX_ACTIVITIES = 4;
const INITIAL_PAST = 2;
const INITIAL_FUTURE = 5;
const LOAD_CHUNK = 4;      // weeks added per intersection trigger

const TILE_COLORS = [
  "bg-blue-500/50 border-blue-400/40",
  "bg-green-500/50 border-green-400/40",
  "bg-orange-500/50 border-orange-400/40",
  "bg-purple-500/50 border-purple-400/40",
];

// ─── date helpers ────────────────────────────────────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

// ─── layout helper ────────────────────────────────────────────────────────────

function getGridStyle(totalSlots: number): { cols: string; lastSpan: boolean } {
  switch (totalSlots) {
    case 1:  return { cols: "grid-cols-1", lastSpan: false };
    case 2:  return { cols: "grid-cols-2", lastSpan: false };
    case 3:  return { cols: "grid-cols-2", lastSpan: true };
    default: return { cols: "grid-cols-2", lastSpan: false };
  }
}

// ─── ActivityTile ─────────────────────────────────────────────────────────────

function ActivityTile({
  activity,
  position,
}: {
  activity: ActivityData;
  position: number;
}) {
  const colorClass = TILE_COLORS[(position - 1) % TILE_COLORS.length];
  const IconComponent = activity.icon
    ? (LucideIcons[activity.icon as keyof typeof LucideIcons] as React.ElementType | undefined)
    : null;

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border w-full h-full min-h-0 overflow-hidden gap-0.5",
        colorClass
      )}
    >
      {IconComponent ? (
        <IconComponent className="w-[40%] h-[40%] max-w-8 max-h-8 text-white shrink-0" />
      ) : (
        <span className="text-white/60 text-[0.6rem]">?</span>
      )}
      <span className="text-white text-[0.55rem] font-semibold leading-tight text-center px-0.5 truncate w-full">
        {activity.label}
      </span>
    </motion.div>
  );
}

// ─── AddTile ──────────────────────────────────────────────────────────────────

function AddTile({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="flex items-center justify-center w-full h-full rounded-lg border border-dashed border-white/15 hover:border-white/40 text-white/20 hover:text-white/60 transition-all duration-150 hover:bg-white/5 min-h-0"
    >
      <Plus className="w-[30%] h-[30%] max-w-5 max-h-5" />
    </button>
  );
}

// ─── DayCell ──────────────────────────────────────────────────────────────────

function DayCell({
  date,
  activities,
  isToday,
  isPast,
  onAddActivity,
  todayRef,
}: {
  date: Date;
  activities: ActivityData[];
  isToday: boolean;
  isPast: boolean;
  onAddActivity?: (date: string, position: number) => void;
  todayRef?: React.Ref<HTMLDivElement>;
}) {
  const sorted = [...activities].sort((a, b) => a.position - b.position);
  const filledCount = sorted.length;
  const hasRoom = filledCount < MAX_ACTIVITIES;
  const totalSlots = hasRoom ? filledCount + 1 : filledCount;
  const { cols, lastSpan } = getGridStyle(totalSlots);
  const nextPosition = filledCount + 1;

  return (
    <div
      ref={isToday ? (todayRef as React.RefObject<HTMLDivElement>) : undefined}
      className={cn(
        "flex flex-col rounded-xl border transition-colors duration-200 overflow-hidden h-full",
        isToday
          ? "border-blue-400/60 bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
          : isPast
          ? "border-white/5 bg-white/[0.02] opacity-60"
          : "border-white/10 bg-white/5"
      )}
    >
      {/* Day header */}
      <div className="flex items-center justify-between px-1.5 pt-1 pb-0.5 shrink-0">
        <span
          className={cn(
            "text-[0.65rem] font-bold leading-none",
            isToday ? "text-blue-300" : isPast ? "text-white/30" : "text-white/60"
          )}
        >
          {date.getDate()}
        </span>
        {isToday && (
          <span className="text-[0.5rem] font-bold text-blue-300 bg-blue-500/30 rounded-full px-1 leading-none py-0.5">
            TODAY
          </span>
        )}
      </div>

      {/* Adaptive icon grid */}
      <div className={cn("grid gap-0.5 p-0.5 flex-1 min-h-0", cols)}>
        {sorted.map((act) => (
          <ActivityTile key={act.id} activity={act} position={act.position} />
        ))}
        {hasRoom && (
          <div className={cn(lastSpan && "col-span-2")}>
            <AddTile onAdd={() => onAddActivity?.(formatDate(date), nextPosition)} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WeekRow ─────────────────────────────────────────────────────────────────

function WeekRow({
  week,
  today,
  activityMap,
  onAddActivity,
  todayRef,
  isCurrentWeek,
}: {
  week: Date[];
  today: Date;
  activityMap: Map<string, ActivityData[]>;
  onAddActivity?: (date: string, position: number) => void;
  todayRef: React.RefObject<HTMLDivElement | null>;
  isCurrentWeek: boolean;
}) {
  return (
    <div
      ref={isCurrentWeek ? (todayRef as React.RefObject<HTMLDivElement>) : undefined}
      className="grid grid-cols-7 gap-1 shrink-0 px-1"
      style={{
        height: `calc((100vh - var(--nav-height) - 42px) / ${VISIBLE_WEEKS})`,
        minHeight: "100px",
      }}
    >
      {week.map((date) => (
        <DayCell
          key={formatDate(date)}
          date={date}
          isToday={isSameDay(date, today)}
          isPast={date < today}
          activities={activityMap.get(formatDate(date)) ?? []}
          onAddActivity={onAddActivity}
        />
      ))}
    </div>
  );
}

// ─── CalendarGrid (main) ──────────────────────────────────────────────────────

export interface CalendarGridProps {
  activities?: ActivityData[];
  profileId?: string;
  onAddActivity?: (date: string, position: number) => void;
}

export function CalendarGrid({
  activities = [],
  onAddActivity,
}: CalendarGridProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentWeekStart = getWeekStart(today);

  // weekOffsets: integers relative to currentWeekStart (0 = this week)
  const makeInitialOffsets = () =>
    Array.from(
      { length: INITIAL_PAST + 1 + INITIAL_FUTURE },
      (_, i) => i - INITIAL_PAST
    );

  const [weekOffsets, setWeekOffsets] = useState<number[]>(makeInitialOffsets);

  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRowRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const isPrepending = useRef(false);
  const prevScrollHeight = useRef(0);

  // Build week arrays from offsets
  const weeks = weekOffsets.map((offset) => {
    const weekStart = addDays(currentWeekStart, offset * 7);
    return { offset, days: Array.from({ length: 7 }, (_, d) => addDays(weekStart, d)) };
  });

  // Activity lookup map
  const activityMap = new Map<string, ActivityData[]>();
  for (const act of activities) {
    const key = act.date.split("T")[0];
    if (!activityMap.has(key)) activityMap.set(key, []);
    activityMap.get(key)!.push(act);
  }

  // Scroll to today on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      todayRowRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }, []);

  // Reset + scroll to today on custom event (triggered by NavBar B1:2)
  const scrollToToday = useCallback(() => {
    setWeekOffsets(makeInitialOffsets());
    requestAnimationFrame(() => {
      todayRowRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    window.addEventListener("calendar:scrollToToday", scrollToToday);
    return () => window.removeEventListener("calendar:scrollToToday", scrollToToday);
  }, [scrollToToday]);

  // IntersectionObserver: load more weeks at top/bottom
  useEffect(() => {
    const topEl = topSentinelRef.current;
    const bottomEl = bottomSentinelRef.current;

    const topObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isPrepending.current = true;
          if (scrollRef.current) {
            prevScrollHeight.current = scrollRef.current.scrollHeight;
          }
          setWeekOffsets((prev) => {
            const min = Math.min(...prev);
            return [
              ...Array.from({ length: LOAD_CHUNK }, (_, i) => min - LOAD_CHUNK + i),
              ...prev,
            ];
          });
        }
      },
      { root: scrollRef.current, rootMargin: "300px" }
    );

    const bottomObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWeekOffsets((prev) => {
            const max = Math.max(...prev);
            return [
              ...prev,
              ...Array.from({ length: LOAD_CHUNK }, (_, i) => max + 1 + i),
            ];
          });
        }
      },
      { root: scrollRef.current, rootMargin: "300px" }
    );

    if (topEl) topObs.observe(topEl);
    if (bottomEl) bottomObs.observe(bottomEl);

    return () => {
      topObs.disconnect();
      bottomObs.disconnect();
    };
  }, []);

  // After prepending: adjust scrollTop so the view doesn't jump
  useLayoutEffect(() => {
    if (isPrepending.current && scrollRef.current && prevScrollHeight.current > 0) {
      const diff = scrollRef.current.scrollHeight - prevScrollHeight.current;
      scrollRef.current.scrollTop += diff;
      isPrepending.current = false;
    }
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day name header — fixed */}
      <div className="grid grid-cols-7 gap-1 px-1 py-0.5 shrink-0">
        {DAY_NAMES.map((day) => (
          <div key={day} className="text-center text-[0.65rem] font-semibold text-white/40">
            {day}
          </div>
        ))}
      </div>

      {/* Scrollable week list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        {/* Top sentinel */}
        <div ref={topSentinelRef} className="h-1" />

        <div className="flex flex-col gap-1 pb-1">
          {weeks.map(({ offset, days }) => {
            const isCurrentWeek = offset === 0;
            return (
              <WeekRow
                key={offset}
                week={days}
                today={today}
                activityMap={activityMap}
                onAddActivity={onAddActivity}
                todayRef={todayRowRef}
                isCurrentWeek={isCurrentWeek}
              />
            );
          })}
        </div>

        {/* Bottom sentinel */}
        <div ref={bottomSentinelRef} className="h-1" />
      </div>
    </div>
  );
}
