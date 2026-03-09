"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ProfileCard } from "@/components/ui/profile-card";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Plus, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { ChildProfileData } from "@/types";

interface ProfilesClientProps {
  ownedProfiles: ChildProfileData[];
  invitedProfiles: ChildProfileData[];
}

export function ProfilesClient({ ownedProfiles, invitedProfiles }: ProfilesClientProps) {
  const router = useRouter();

  function selectProfile(profileId: string) {
    sessionStorage.setItem("activeProfileId", profileId);
    router.push("/aac");
  }

  const allProfiles = [...ownedProfiles, ...invitedProfiles];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06)_0%,transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-3xl flex flex-col gap-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Select Profile</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {allProfiles.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-white/40">
            <span className="text-5xl" role="img" aria-label="child">
              👶
            </span>
            <p className="text-lg">No profiles yet</p>
            <p className="text-sm text-center">
              Create a profile for a child to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                name={profile.name}
                image={profile.image}
                onClick={() => selectProfile(profile.id)}
              />
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <ShinyButton
            onClick={() => router.push("/profiles/new")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-base"
          >
            <Plus className="w-5 h-5" />
            Create New Profile
          </ShinyButton>
        </div>
      </motion.div>
    </div>
  );
}
