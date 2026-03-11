import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const CORE_VOCAB = new Set([
  "yes", "no", "more", "help", "stop", "go", "want", "need", "like",
  "eat", "drink", "sleep", "play", "happy", "sad", "hurt", "sick",
  "hot", "cold", "home", "school",
]);

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profileId = req.nextUrl.searchParams.get("profileId");
  const range = Math.min(parseInt(req.nextUrl.searchParams.get("range") ?? "30"), 365);
  if (!profileId) return NextResponse.json({ error: "profileId required" }, { status: 400 });

  const profile = await prisma.childProfile.findFirst({
    where: {
      id: profileId,
      OR: [
        { ownerId: session.user.id },
        { accessList: { some: { userId: session.user.id } } },
      ],
    },
    select: { id: true, name: true },
  });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  const since = addDays(now, -range);
  const prevSince = addDays(since, -range);

  const [events, prevCount, ftEvents] = await Promise.all([
    prisma.buttonPressEvent.findMany({
      where: { profileId, pressedAt: { gte: since } },
      orderBy: { pressedAt: "asc" },
    }),
    prisma.buttonPressEvent.count({
      where: { profileId, pressedAt: { gte: prevSince, lt: since } },
    }),
    prisma.firstThenEvent.findMany({
      where: { profileId, completedAt: { gte: since } },
    }),
  ]);

  // Active days
  const daySet = new Set(events.map((e) => toDateStr(e.pressedAt)));
  const activeDays = daySet.size;

  // Unique words
  const wordSet = new Set(events.map((e) => e.buttonLabel.toLowerCase()));
  const uniqueWords = wordSet.size;

  // Core vocabulary coverage
  const coreUsed = [...wordSet].filter((w) => CORE_VOCAB.has(w)).length;

  // Daily presses — last 14 days
  const dailyPresses: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = toDateStr(addDays(now, -i));
    dailyPresses.push({ date: d, count: events.filter((e) => toDateStr(e.pressedAt) === d).length });
  }

  // Top 12 words
  const wordCounts: Record<string, number> = {};
  for (const e of events) {
    wordCounts[e.buttonLabel] = (wordCounts[e.buttonLabel] ?? 0) + 1;
  }
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([label, count]) => ({
      label,
      count,
      isCore: CORE_VOCAB.has(label.toLowerCase()),
    }));

  // Hourly distribution
  const hourCounts = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: events.filter((e) => e.pressedAt.getHours() === h).length,
  }));

  // Weekly unique words — last 8 weeks
  const weeklyTrend: { label: string; unique: number; total: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const wStart = addDays(now, -(i + 1) * 7);
    const wEnd = addDays(wStart, 7);
    const wEvents = events.filter((e) => e.pressedAt >= wStart && e.pressedAt < wEnd);
    const wWords = new Set(wEvents.map((e) => e.buttonLabel.toLowerCase()));
    weeklyTrend.push({
      label: i === 0 ? "Last wk" : `−${i + 1}w`,
      unique: wWords.size,
      total: wEvents.length,
    });
  }

  // School-hours usage (8am–3pm)
  const schoolHourEvents = events.filter((e) => {
    const h = e.pressedAt.getHours();
    return h >= 8 && h < 15;
  });

  const thisWeek = events.filter((e) => e.pressedAt >= addDays(now, -7)).length;

  return NextResponse.json({
    profile: { id: profile.id, name: profile.name },
    range,
    generatedAt: now.toISOString(),
    summary: {
      totalPresses: events.length,
      prevPeriodPresses: prevCount,
      pressesThisWeek: thisWeek,
      activeDays,
      totalDays: range,
      uniqueWords,
      coreWordsUsed: coreUsed,
      coreVocabSize: CORE_VOCAB.size,
      avgPerActiveDay: activeDays > 0 ? Math.round(events.length / activeDays) : 0,
      firstThenCompletions: ftEvents.length,
      schoolHourPct:
        events.length > 0 ? Math.round((schoolHourEvents.length / events.length) * 100) : 0,
    },
    dailyPresses,
    topWords,
    hourlyDistribution: hourCounts,
    weeklyTrend,
    firstThenBreakdown: {
      wait: ftEvents.filter((e) => e.firstMode === "wait").length,
      taskCount: ftEvents.filter((e) => e.firstMode === "task-count").length,
      taskDuration: ftEvents.filter((e) => e.firstMode === "task-duration").length,
    },
  });
}
