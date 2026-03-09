import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: profileId } = await params;
  const { email } = (await req.json()) as { email: string };

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Verify ownership
  const profile = await prisma.childProfile.findFirst({
    where: { id: profileId, ownerId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found or access denied" }, { status: 404 });
  }

  const invitee = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!invitee) {
    return NextResponse.json(
      { error: "No account found for that email. They must sign in first." },
      { status: 404 }
    );
  }

  if (invitee.id === session.user.id) {
    return NextResponse.json({ error: "Cannot invite yourself" }, { status: 400 });
  }

  const access = await prisma.profileAccess.upsert({
    where: { profileId_userId: { profileId, userId: invitee.id } },
    create: { profileId, userId: invitee.id },
    update: {},
  });

  return NextResponse.json(access, { status: 201 });
}
