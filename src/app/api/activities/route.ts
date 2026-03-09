import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ error: "profileId required" }, { status: 400 });
  }

  // Verify access
  const hasAccess = await checkProfileAccess(session.user.id, profileId);
  if (!hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const activities = await prisma.activity.findMany({
    where: { profileId },
    orderBy: [{ date: "asc" }, { position: "asc" }],
  });

  return NextResponse.json(
    activities.map((a) => ({
      id: a.id,
      profileId: a.profileId,
      date: a.date.toISOString(),
      icon: a.icon,
      label: a.label,
      position: a.position,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    profileId: string;
    date: string;
    icon: string;
    label: string;
    position: number;
  };

  const { profileId, date, icon, label, position } = body;

  if (!profileId || !date || !label || !position) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (position < 1 || position > 4) {
    return NextResponse.json({ error: "Position must be 1-4" }, { status: 400 });
  }

  const hasAccess = await checkProfileAccess(session.user.id, profileId);
  if (!hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const activity = await prisma.activity.create({
    data: {
      profileId,
      date: new Date(date),
      icon: icon || "Star",
      label,
      position,
    },
  });

  return NextResponse.json(
    {
      id: activity.id,
      profileId: activity.profileId,
      date: activity.date.toISOString(),
      icon: activity.icon,
      label: activity.label,
      position: activity.position,
    },
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const hasAccess = await checkProfileAccess(session.user.id, activity.profileId);
  if (!hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  await prisma.activity.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

async function checkProfileAccess(userId: string, profileId: string): Promise<boolean> {
  const profile = await prisma.childProfile.findFirst({
    where: { id: profileId, ownerId: userId },
  });
  if (profile) return true;

  const access = await prisma.profileAccess.findFirst({
    where: { profileId, userId },
  });
  return !!access;
}
