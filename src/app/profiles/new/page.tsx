"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { ArrowLeft, UserPlus, Mail, Trash2 } from "lucide-react";

export default function NewProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteList, setInviteList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || inviteList.includes(email)) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email address");
      return;
    }
    setInviteList((prev) => [...prev, email]);
    setInviteEmail("");
    setError("");
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError("Please enter the child's name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), inviteEmails: inviteList }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create profile");
        return;
      }
      router.push("/profiles");
    } catch {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06)_0%,transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg flex flex-col gap-6 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          <UserPlus className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white">Create Child Profile</h1>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">
            Child&apos;s Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emma"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        {/* Invite by email */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">
            Invite caregivers by email (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addInvite()}
              placeholder="caregiver@example.com"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <button
              onClick={addInvite}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:bg-blue-500/40 transition text-sm"
            >
              <Mail className="w-4 h-4" />
              Add
            </button>
          </div>

          {inviteList.length > 0 && (
            <ul className="flex flex-col gap-1.5 mt-1">
              {inviteList.map((email) => (
                <li
                  key={email}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => setInviteList((prev) => prev.filter((e) => e !== email))}
                    className="text-white/30 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <ShinyButton
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-3 text-base rounded-2xl"
        >
          {loading ? "Creating..." : "Create Profile"}
        </ShinyButton>
      </motion.div>
    </div>
  );
}
