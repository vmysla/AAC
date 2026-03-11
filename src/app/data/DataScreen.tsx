"use client";

import { useState, useEffect, useCallback } from "react";
import { NavBar } from "@/components/layout/NavBar";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  profile: { id: string; name: string };
  range: number;
  generatedAt: string;
  summary: {
    totalPresses: number;
    prevPeriodPresses: number;
    pressesThisWeek: number;
    activeDays: number;
    totalDays: number;
    uniqueWords: number;
    coreWordsUsed: number;
    coreVocabSize: number;
    avgPerActiveDay: number;
    firstThenCompletions: number;
    schoolHourPct: number;
  };
  dailyPresses: { date: string; count: number }[];
  topWords: { label: string; count: number; isCore: boolean }[];
  hourlyDistribution: { hour: number; count: number }[];
  weeklyTrend: { label: string; unique: number; total: number }[];
  firstThenBreakdown: { wait: number; taskCount: number; taskDuration: number };
}

// ─── SVG Chart helpers ────────────────────────────────────────────────────────

function BarChart({
  data,
  color = "#60a5fa",
  height = 80,
  showLabels = false,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  showLabels?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = 100 / data.length;
  return (
    <svg viewBox={`0 0 100 ${height + (showLabels ? 14 : 0)}`} className="w-full" preserveAspectRatio="none">
      {data.map((d, i) => {
        const barH = (d.value / max) * (height - 4);
        const x = i * barW + barW * 0.1;
        const w = barW * 0.8;
        const y = height - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={Math.max(barH, d.value > 0 ? 2 : 0)} rx="1.5" fill={color} opacity={0.75} />
            {showLabels && i % Math.ceil(data.length / 7) === 0 && (
              <text x={x + w / 2} y={height + 10} textAnchor="middle" fontSize="4" fill="#94a3b8">{d.label.slice(5)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function HorizontalBar({ label, value, max, isCore }: { label: string; value: number; max: number; isCore: boolean }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className={cn("w-20 text-xs font-medium truncate shrink-0", isCore ? "text-teal-300" : "text-white/70")}>{label}</span>
      <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", isCore ? "bg-teal-500/70" : "bg-purple-500/60")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-xs text-white/50 text-right shrink-0">{value}</span>
    </div>
  );
}

function LineChart({ data, color = "#34d399" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const H = 60;
  const W = 100;
  const step = W / (data.length - 1);
  const points = data
    .map((d, i) => `${i * step},${H - (d.value / max) * (H - 4)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={i * step} cy={H - (d.value / max) * (H - 4)} r="2.5" fill={color} />
      ))}
    </svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  colorClass,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  colorClass: string;
  trend?: number; // positive = up, negative = down
}) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-2xl border p-4", colorClass)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider opacity-60">{label}</span>
        <Icon className="w-4 h-4 opacity-50" />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-black text-white">{value}</span>
        {trend !== undefined && trend !== 0 && (
          <span className={cn("text-xs font-semibold mb-1", trend > 0 ? "text-green-400" : "text-red-400")}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      {sub && <span className="text-xs opacity-50">{sub}</span>}
    </div>
  );
}

// ─── Report text generation ───────────────────────────────────────────────────

function buildInsuranceReport(d: AnalyticsData): string {
  const { summary, profile, range, generatedAt } = d;
  const pctChange =
    summary.prevPeriodPresses > 0
      ? Math.round(((summary.totalPresses - summary.prevPeriodPresses) / summary.prevPeriodPresses) * 100)
      : null;
  const date = new Date(generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `AAC DEVICE UTILIZATION REPORT
For Insurance / Medical Necessity Documentation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Student/Patient: ${profile.name}
Reporting Period: Last ${range} days
Report Generated: ${date}

USAGE SUMMARY
• Device used on ${summary.activeDays} of ${summary.totalDays} days (${Math.round((summary.activeDays / summary.totalDays) * 100)}% utilization rate)
• Total communication activations: ${summary.totalPresses}
• Average activations on active days: ${summary.avgPerActiveDay}
• Unique vocabulary items demonstrated: ${summary.uniqueWords} words
• This week's activations: ${summary.pressesThisWeek}

COMMUNICATION GROWTH
${pctChange !== null ? `• Activations vs. prior ${range}-day period: ${pctChange >= 0 ? "+" : ""}${pctChange}%` : "• Prior period comparison: insufficient baseline data"}
• Core vocabulary demonstrated: ${summary.coreWordsUsed} of ${summary.coreVocabSize} core words
• First-Then board completed: ${summary.firstThenCompletions} time(s) — demonstrates functional communication for self-regulation

CLINICAL NOTES
This report documents active, functional use of a speech-generating device across ${summary.activeDays} separate days. Consistent daily device use, vocabulary breadth of ${summary.uniqueWords} unique words, and demonstrated use of behavioral support tools (First-Then board) collectively provide evidence of functional communication gains and ongoing medical necessity for continued device access.

Generated automatically by AAC Device Application.`;
}

function buildABAReport(d: AnalyticsData): string {
  const { summary, profile, range, topWords, hourlyDistribution, firstThenBreakdown, generatedAt } = d;
  const top5 = topWords.slice(0, 5).map((w) => `${w.label} (${w.count}×)`).join(", ");
  const peakHour = [...hourlyDistribution].sort((a, b) => b.count - a.count)[0];
  const peakTime = peakHour ? `${peakHour.hour}:00–${peakHour.hour + 1}:00` : "N/A";
  const coreRatio = summary.uniqueWords > 0 ? Math.round((summary.coreWordsUsed / summary.uniqueWords) * 100) : 0;
  const date = new Date(generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const ftTotal = firstThenBreakdown.wait + firstThenBreakdown.taskCount + firstThenBreakdown.taskDuration;
  return `ABA COMMUNICATION SKILLS SUMMARY
For Behavioral Support / ABA Documentation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Student: ${profile.name}
Reporting Period: Last ${range} days
Report Generated: ${date}

USAGE FREQUENCY
• Total communication activations: ${summary.totalPresses}
• Active days: ${summary.activeDays} / ${summary.totalDays} (${Math.round((summary.activeDays / summary.totalDays) * 100)}%)
• Average activations on active days: ${summary.avgPerActiveDay}
• Peak usage time: ${peakTime}

VOCABULARY PROFILE
• Total unique words demonstrated: ${summary.uniqueWords}
• Core vocabulary coverage: ${summary.coreWordsUsed} words (${coreRatio}% of unique vocabulary is core)
• Top 5 activated words: ${top5 || "N/A"}
• Note: Core vocabulary use of ≥30% is considered a positive indicator of generative language development.

BEHAVIORAL SUPPORT TOOLS (First-Then Board)
• Total First-Then completions: ${ftTotal}
  — Wait mode: ${firstThenBreakdown.wait}× (timer-based delay of gratification)
  — Task (count) mode: ${firstThenBreakdown.taskCount}× (token economy)
  — Task (timed) mode: ${firstThenBreakdown.taskDuration}× (duration-based reinforcement)
• First-Then board use supports schedule predictability, FCT, and delay of gratification across all reinforcement modalities.

RECOMMENDATIONS
• Monitor shift in word diversity week over week; target ≥5 new unique words per week.
• Track spontaneous vs. elicited activations by recording prompt levels during sessions.
• Consider expanding core vocabulary access if core ratio falls below 20%.

Generated automatically by AAC Device Application.`;
}

function buildSchoolReport(d: AnalyticsData): string {
  const { summary, profile, range, topWords, weeklyTrend, generatedAt } = d;
  const date = new Date(generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const recentWeek = weeklyTrend[weeklyTrend.length - 1];
  const prevWeek = weeklyTrend[weeklyTrend.length - 2];
  const vocabGrowth =
    recentWeek && prevWeek && prevWeek.unique > 0
      ? `${recentWeek.unique} unique words this week vs. ${prevWeek.unique} the prior week`
      : `${recentWeek?.unique ?? 0} unique words this week`;
  const top3 = topWords.slice(0, 3).map((w) => w.label).join(", ");
  return `AAC PROGRESS SUMMARY FOR IEP DOCUMENTATION
School-Based Speech-Language Pathology
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Student: ${profile.name}
Reporting Period: Last ${range} days
Report Generated: ${date}

PRESENT LEVEL OF PERFORMANCE DATA
• Device activated on ${summary.activeDays} of ${summary.totalDays} school-period days
• Total communication attempts logged: ${summary.totalPresses}
• Unique vocabulary demonstrated: ${summary.uniqueWords} distinct words/symbols
• Average activations on active days: ${summary.avgPerActiveDay}
• School-hours usage (8am–3pm): ${summary.schoolHourPct}% of all activations

VOCABULARY DEVELOPMENT
• Core vocabulary demonstrated: ${summary.coreWordsUsed} words (of ${summary.coreVocabSize}-word core set)
• Vocabulary growth: ${vocabGrowth}
• Frequently used words: ${top3 || "N/A"}

SELF-REGULATION & BEHAVIORAL SUPPORT
• First-Then board used and completed: ${summary.firstThenCompletions} time(s) in the reporting period
• Use of First-Then board demonstrates ability to participate in schedule-based communication and delay of reinforcement — skills aligned with social-emotional IEP goals.

EDUCATIONAL RELEVANCE
The student's use of the AAC device during school hours (${summary.schoolHourPct}% of activations) and demonstrated vocabulary of ${summary.uniqueWords} unique items support meaningful participation in educational settings. Data may be used to update Present Level of Performance (PLAAFP) statements and establish measurable annual goal baselines.

This report was generated automatically. It should be reviewed by the IEP team SLP before submission.
Generated by AAC Device Application.`;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const RANGE_OPTIONS = [7, 14, 30, 90];

export function DataScreen() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState(30);
  const [activeTab, setActiveTab] = useState<"overview" | "words" | "usage" | "reports">("overview");
  const [copiedReport, setCopiedReport] = useState<string | null>(null);

  const fetchData = useCallback(async (r: number) => {
    setLoading(true);
    setError(null);
    try {
      const profileId = typeof window !== "undefined" ? sessionStorage.getItem("activeProfileId") : null;
      if (!profileId) {
        setError("No profile selected. Go back and select a profile first.");
        return;
      }
      const res = await fetch(`/api/analytics?profileId=${profileId}&range=${r}`);
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  async function copyReport(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopiedReport(key);
    setTimeout(() => setCopiedReport(null), 2000);
  }

  const trend =
    data && data.summary.prevPeriodPresses > 0
      ? Math.round(
          ((data.summary.totalPresses - data.summary.prevPeriodPresses) /
            data.summary.prevPeriodPresses) *
            100
        )
      : undefined;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden">
      <NavBar />

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <LucideIcons.BarChart2 className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">
            {data ? `${data.profile.name} — Usage Data` : "Usage Analytics"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                range === r
                  ? "bg-blue-600/50 text-blue-200 border border-blue-500/50"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              {r === 7 ? "7d" : r === 14 ? "14d" : r === 30 ? "30d" : "90d"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      {data && (
        <div className="flex gap-1 px-4 pt-2 shrink-0 border-b border-white/5">
          {(["overview", "words", "usage", "reports"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-t-lg text-xs font-bold capitalize transition-all border-b-2",
                activeTab === tab
                  ? "text-white border-blue-400 bg-white/5"
                  : "text-white/40 border-transparent hover:text-white/60"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-white/40">
              <LucideIcons.RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-sm">Loading analytics...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-white/40 max-w-sm text-center">
              <LucideIcons.AlertCircle className="w-10 h-10 text-amber-400/60" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {data && !loading && (
          <>
            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Stat cards */}
                <div className="grid grid-cols-5 gap-3">
                  <StatCard
                    label="Total presses"
                    value={data.summary.totalPresses}
                    sub={`last ${range} days`}
                    icon={LucideIcons.MousePointerClick}
                    colorClass="bg-blue-500/10 border-blue-500/20 text-blue-200"
                    trend={trend}
                  />
                  <StatCard
                    label="This week"
                    value={data.summary.pressesThisWeek}
                    icon={LucideIcons.TrendingUp}
                    colorClass="bg-green-500/10 border-green-500/20 text-green-200"
                  />
                  <StatCard
                    label="Active days"
                    value={`${data.summary.activeDays}/${data.summary.totalDays}`}
                    sub={`${Math.round((data.summary.activeDays / data.summary.totalDays) * 100)}% utilization`}
                    icon={LucideIcons.CalendarDays}
                    colorClass="bg-purple-500/10 border-purple-500/20 text-purple-200"
                  />
                  <StatCard
                    label="Unique words"
                    value={data.summary.uniqueWords}
                    sub={`${data.summary.coreWordsUsed} core vocab`}
                    icon={LucideIcons.BookOpen}
                    colorClass="bg-amber-500/10 border-amber-500/20 text-amber-200"
                  />
                  <StatCard
                    label="First-Then done"
                    value={data.summary.firstThenCompletions}
                    sub="board completions"
                    icon={LucideIcons.ListOrdered}
                    colorClass="bg-teal-500/10 border-teal-500/20 text-teal-200"
                  />
                </div>

                {/* Daily bar chart */}
                <div className="bg-white/3 rounded-2xl border border-white/8 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                    Daily activations — last 14 days
                  </h3>
                  {data.summary.totalPresses === 0 ? (
                    <div className="flex items-center justify-center h-20 text-white/20 text-sm">
                      No data yet — start using the AAC screen
                    </div>
                  ) : (
                    <BarChart
                      data={data.dailyPresses.map((d) => ({ label: d.date, value: d.count }))}
                      color="#60a5fa"
                      height={80}
                      showLabels
                    />
                  )}
                </div>

                {/* Weekly trend */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/3 rounded-2xl border border-white/8 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                      Weekly total activations
                    </h3>
                    <LineChart
                      data={data.weeklyTrend.map((w) => ({ label: w.label, value: w.total }))}
                      color="#60a5fa"
                    />
                    <div className="flex justify-between mt-1">
                      {data.weeklyTrend.map((w, i) => (
                        <span key={i} className="text-[0.6rem] text-white/20">{w.label}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/3 rounded-2xl border border-white/8 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                      Weekly unique vocabulary
                    </h3>
                    <LineChart
                      data={data.weeklyTrend.map((w) => ({ label: w.label, value: w.unique }))}
                      color="#34d399"
                    />
                    <div className="flex justify-between mt-1">
                      {data.weeklyTrend.map((w, i) => (
                        <span key={i} className="text-[0.6rem] text-white/20">{w.label}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── WORDS TAB ── */}
            {activeTab === "words" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    label="Unique words"
                    value={data.summary.uniqueWords}
                    icon={LucideIcons.Layers}
                    colorClass="bg-purple-500/10 border-purple-500/20 text-purple-200"
                  />
                  <StatCard
                    label="Core vocab used"
                    value={`${data.summary.coreWordsUsed}/${data.summary.coreVocabSize}`}
                    sub={`${Math.round((data.summary.coreWordsUsed / data.summary.coreVocabSize) * 100)}% coverage`}
                    icon={LucideIcons.Bookmark}
                    colorClass="bg-teal-500/10 border-teal-500/20 text-teal-200"
                  />
                  <StatCard
                    label="Avg per active day"
                    value={data.summary.avgPerActiveDay}
                    sub="activations / day"
                    icon={LucideIcons.Activity}
                    colorClass="bg-blue-500/10 border-blue-500/20 text-blue-200"
                  />
                </div>

                <div className="bg-white/3 rounded-2xl border border-white/8 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
                      Top words used
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-white/30">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> Core vocab</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Fringe vocab</span>
                    </div>
                  </div>
                  {data.topWords.length === 0 ? (
                    <p className="text-white/20 text-sm text-center py-4">No word data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {data.topWords.map((w, i) => (
                        <HorizontalBar
                          key={i}
                          label={w.label}
                          value={w.count}
                          max={data.topWords[0].count}
                          isCore={w.isCore}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white/3 rounded-2xl border border-white/8 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                    Vocabulary diversity over time
                  </h3>
                  <LineChart
                    data={data.weeklyTrend.map((w) => ({ label: w.label, value: w.unique }))}
                    color="#34d399"
                  />
                  <p className="text-xs text-white/30 mt-2">Unique words per week. Rising trend = vocabulary growth.</p>
                </div>
              </motion.div>
            )}

            {/* ── USAGE TAB ── */}
            {activeTab === "usage" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="School-hours use"
                    value={`${data.summary.schoolHourPct}%`}
                    sub="of activations 8am–3pm"
                    icon={LucideIcons.School}
                    colorClass="bg-amber-500/10 border-amber-500/20 text-amber-200"
                  />
                  <StatCard
                    label="First-Then modes"
                    value={data.summary.firstThenCompletions}
                    sub={`Wait ${data.firstThenBreakdown.wait} / Task× ${data.firstThenBreakdown.taskCount} / Timed ${data.firstThenBreakdown.taskDuration}`}
                    icon={LucideIcons.ListOrdered}
                    colorClass="bg-green-500/10 border-green-500/20 text-green-200"
                  />
                </div>

                {/* Hour-of-day distribution */}
                <div className="bg-white/3 rounded-2xl border border-white/8 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                    Usage by hour of day
                  </h3>
                  <div className="flex items-end gap-0.5 h-16">
                    {data.hourlyDistribution.map((h) => {
                      const max = Math.max(...data.hourlyDistribution.map((x) => x.count), 1);
                      const pct = (h.count / max) * 100;
                      const isSchool = h.hour >= 8 && h.hour < 15;
                      return (
                        <div key={h.hour} className="flex-1 flex flex-col items-center gap-0.5" title={`${h.hour}:00 — ${h.count} presses`}>
                          <div
                            className={cn("w-full rounded-sm transition-all", isSchool ? "bg-amber-400/60" : "bg-blue-500/40")}
                            style={{ height: `${Math.max(pct, h.count > 0 ? 4 : 0)}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1 text-[0.55rem] text-white/20">
                    <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
                  </div>
                  <p className="text-xs text-white/30 mt-1">
                    <span className="inline-block w-2 h-2 rounded-sm bg-amber-400/60 mr-1" />School hours (8am–3pm) highlighted
                  </p>
                </div>

                {/* First-Then breakdown */}
                {data.summary.firstThenCompletions > 0 && (
                  <div className="bg-white/3 rounded-2xl border border-white/8 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                      First-Then board breakdown
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Wait", count: data.firstThenBreakdown.wait, color: "text-amber-300", bg: "bg-amber-500/15" },
                        { label: "Task × times", count: data.firstThenBreakdown.taskCount, color: "text-purple-300", bg: "bg-purple-500/15" },
                        { label: "Task for time", count: data.firstThenBreakdown.taskDuration, color: "text-teal-300", bg: "bg-teal-500/15" },
                      ].map((item) => (
                        <div key={item.label} className={cn("rounded-xl p-3 text-center", item.bg)}>
                          <div className={cn("text-2xl font-black", item.color)}>{item.count}</div>
                          <div className="text-xs text-white/50 mt-1">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── REPORTS TAB ── */}
            {activeTab === "reports" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <p className="text-xs text-white/40">
                  Auto-generated report summaries for clinical documentation. Copy and paste into your forms.
                </p>

                {[
                  {
                    key: "insurance",
                    title: "Insurance / Medical Necessity",
                    icon: LucideIcons.ShieldCheck,
                    color: "border-blue-500/30 bg-blue-500/5",
                    iconColor: "text-blue-400",
                    desc: "For prior authorization, re-authorization, and continued coverage documentation.",
                    report: buildInsuranceReport(data),
                  },
                  {
                    key: "aba",
                    title: "ABA / Behavioral Therapy",
                    icon: LucideIcons.Brain,
                    color: "border-purple-500/30 bg-purple-500/5",
                    iconColor: "text-purple-400",
                    desc: "For ABA session notes, BCaBA/BCBA supervision, and FCT documentation.",
                    report: buildABAReport(data),
                  },
                  {
                    key: "school",
                    title: "School / IEP Documentation",
                    icon: LucideIcons.GraduationCap,
                    color: "border-amber-500/30 bg-amber-500/5",
                    iconColor: "text-amber-400",
                    desc: "For IEP PLAAFP statements, quarterly progress reports, and SLP session notes.",
                    report: buildSchoolReport(data),
                  },
                ].map(({ key, title, icon: Icon, color, iconColor, desc, report }) => (
                  <div key={key} className={cn("rounded-2xl border p-4 space-y-3", color)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("w-5 h-5 shrink-0", iconColor)} />
                        <div>
                          <h3 className="text-sm font-bold text-white">{title}</h3>
                          <p className="text-xs text-white/40">{desc}</p>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyReport(report, key)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border",
                          copiedReport === key
                            ? "bg-green-500/30 border-green-400/50 text-green-300"
                            : "bg-white/10 border-white/10 text-white/70 hover:bg-white/15"
                        )}
                      >
                        {copiedReport === key ? (
                          <><LucideIcons.Check className="w-3 h-3" /> Copied!</>
                        ) : (
                          <><LucideIcons.Copy className="w-3 h-3" /> Copy report</>
                        )}
                      </motion.button>
                    </div>
                    <pre className="text-xs text-white/50 whitespace-pre-wrap font-mono bg-black/20 rounded-xl p-3 max-h-40 overflow-y-auto leading-relaxed">
                      {report}
                    </pre>
                  </div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
