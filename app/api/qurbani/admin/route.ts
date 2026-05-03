import { NextResponse } from "next/server";
import { getQurbaniAdminKey } from "@/lib/qurbani";
import { getQurbaniSummaryAndSubmissions } from "@/lib/qurbani-store";

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
    const data = await getQurbaniSummaryAndSubmissions();
    return NextResponse.json(data);
  } catch (error) {
    console.error("QURBANI_ADMIN_ERROR:", error);
    return NextResponse.json({ error: "Unable to load Qurbani submissions" }, { status: 500 });
  }
}
