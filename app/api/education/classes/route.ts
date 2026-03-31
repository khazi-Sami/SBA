import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { tryCreateGoogleMeetLink } from "@/lib/education/meet";

export async function GET() {
  const prisma = getPrisma();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classes = await prisma.class.findMany({
    where: { status: "SCHEDULED", scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    include: { teacher: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ classes });
}

export async function POST(req: Request) {
  const prisma = getPrisma();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only teachers can schedule classes" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim() || null;
  const scheduledAtRaw = String(body.scheduledAt ?? "").trim();
  const durationMinutes = Number(body.durationMinutes ?? 60);
  const mode = String(body.mode ?? "manual");
  const manualMeetLink = String(body.manualMeetLink ?? "").trim();

  if (!title || !scheduledAtRaw || Number.isNaN(durationMinutes) || durationMinutes < 15) {
    return NextResponse.json({ error: "title, scheduledAt, and valid durationMinutes are required" }, { status: 400 });
  }

  const scheduledAt = new Date(scheduledAtRaw);
  if (Number.isNaN(scheduledAt.getTime())) {
    return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 400 });
  }

  let meetLink = manualMeetLink;

  if (mode === "auto") {
    try {
      meetLink = await tryCreateGoogleMeetLink({
        title,
        description: description ?? undefined,
        scheduledAt,
        durationMinutes,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Meet link creation failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (!meetLink || !/^https?:\/\//i.test(meetLink)) {
    return NextResponse.json({ error: "Valid meet link is required (or use auto mode with API config)." }, { status: 400 });
  }

  const created = await prisma.class.create({
    data: {
      title,
      description,
      scheduledAt,
      durationMinutes,
      meetLink,
      teacherId: session.user.id,
    },
  });

  return NextResponse.json({ class: created }, { status: 201 });
}
