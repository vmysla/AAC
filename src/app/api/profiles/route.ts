import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await prisma.childProfile.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, inviteEmails = [] } = body as {
    name: string;
    inviteEmails: string[];
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const profile = await prisma.childProfile.create({
    data: {
      name: name.trim(),
      ownerId: session.user.id,
    },
  });

  // Process invite emails
  for (const email of inviteEmails) {
    const invitee = await prisma.user.findUnique({ where: { email } });
    if (invitee && invitee.id !== session.user.id) {
      await prisma.profileAccess.upsert({
        where: { profileId_userId: { profileId: profile.id, userId: invitee.id } },
        create: { profileId: profile.id, userId: invitee.id },
        update: {},
      });
    }
    // If user doesn't exist yet, the invite is noted but not stored
    // (future: store pending invites by email)
  }

  return NextResponse.json(profile, { status: 201 });
}
