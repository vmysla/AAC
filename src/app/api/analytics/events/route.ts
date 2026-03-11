import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { profileId, buttonLabel, buttonRow, buttonCol } = await req.json();
  if (!profileId || !buttonLabel) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Verify access
  const profile = await prisma.childProfile.findFirst({
    where: {
      id: profileId,
      OR: [
        { ownerId: session.user.id },
        { accessList: { some: { userId: session.user.id } } },
      ],
    },
    select: { id: true },
  });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.buttonPressEvent.create({
    data: { profileId, buttonLabel, buttonRow: buttonRow ?? 0, buttonCol: buttonCol ?? 0 },
  });

  return NextResponse.json({ ok: true });
}
