import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProfilesClient } from "./ProfilesClient";

export default async function ProfilesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  // Profiles owned by user
  const ownedProfiles = await prisma.childProfile.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });

  // Profiles user was invited to
  const invitedAccess = await prisma.profileAccess.findMany({
    where: { userId },
    include: { profile: true },
  });

  const invitedProfiles = invitedAccess.map((a) => a.profile);

  return (
    <ProfilesClient
      ownedProfiles={ownedProfiles.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        ownerId: p.ownerId,
        createdAt: p.createdAt,
      }))}
      invitedProfiles={invitedProfiles.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        ownerId: p.ownerId,
        createdAt: p.createdAt,
      }))}
    />
  );
}
