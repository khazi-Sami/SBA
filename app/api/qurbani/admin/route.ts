import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getQurbaniAdminKey } from "@/lib/qurbani";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = String(searchParams.get("key") ?? "").trim();
  const adminKey = getQurbaniAdminKey();

  if (!adminKey) {
    return NextResponse.json(
      { error: "Qurbani admin access is not configured. Set QURBANI_ADMIN_KEY." },
      { status: 503 }
    );
  }

  if (!key || key !== adminKey) {
    return NextResponse.json({ error: "Invalid admin access key" }, { status: 401 });
  }

  try {
    const prisma = getPrisma();
    const [submissions, aggregate] = await Promise.all([
      prisma.qurbaniSubmission.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.qurbaniSubmission.aggregate({
        _count: { _all: true },
        _sum: { shares: true, totalAmount: true },
      }),
    ]);

    return NextResponse.json({
      summary: {
        totalParticipants: aggregate._count._all,
        totalShares: aggregate._sum.shares ?? 0,
        totalExpectedAmount: aggregate._sum.totalAmount ?? 0,
      },
      submissions,
    });
  } catch (error) {
    console.error("QURBANI_ADMIN_ERROR:", error);
    return NextResponse.json({ error: "Unable to load Qurbani submissions" }, { status: 500 });
  }
}
