import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrisma();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recordings = await prisma.recording.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      class: { select: { id: true, title: true, scheduledAt: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ recordings });
}

export async function POST(req: Request) {
  const prisma = getPrisma();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only teachers can upload recordings" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const classId = String(body.classId ?? "").trim();
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim() || null;
  const videoUrl = String(body.videoUrl ?? "").trim();
  const thumbnailUrl = String(body.thumbnailUrl ?? "").trim() || null;

  if (!classId || !title || !videoUrl) {
    return NextResponse.json({ error: "classId, title, and videoUrl are required" }, { status: 400 });
  }

  const klass = await prisma.class.findUnique({ where: { id: classId } });
  if (!klass) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  if (session.user.role === "TEACHER" && klass.teacherId !== session.user.id) {
    return NextResponse.json({ error: "You can only add recordings to your classes" }, { status: 403 });
  }

  const recording = await prisma.recording.create({
    data: {
      classId,
      title,
      description,
      videoUrl,
      thumbnailUrl,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ recording }, { status: 201 });
}
