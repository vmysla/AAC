"use client";

import { useState, useEffect } from "react";
import { NavBar } from "@/components/layout/NavBar";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { ActivityData } from "@/types";

export function CalendarScreen() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("activeProfileId");
    setProfileId(id);
    if (id) {
      fetchActivities(id);
    }
  }, []);

  async function fetchActivities(pid: string) {
    try {
      const res = await fetch(`/api/activities?profileId=${pid}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch {
      // silent fail — grid still renders without activities
    }
  }

  async function handleAddActivity(date: string, position: number) {
    if (!profileId) return;

    const label = prompt(`Activity name for slot ${position}:`);
    if (!label) return;

    const icon = "Star"; // default icon

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, date, icon, label, position }),
      });
      if (res.ok) {
        const newActivity = await res.json();
        setActivities((prev) => [...prev, newActivity]);
      }
    } catch {
      // silent fail
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Navigation row */}
      <NavBar />

      {/* Calendar grid fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <CalendarGrid
          activities={activities}
          profileId={profileId ?? undefined}
          onAddActivity={handleAddActivity}
        />
      </div>
    </div>
  );
}
