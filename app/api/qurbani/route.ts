import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import {
  calculateQurbaniTotal,
  qurbaniMeatOptions,
  qurbaniPaymentOptions,
  qurbaniShareOptions,
} from "@/lib/qurbani";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const participantName = String(body.participantName ?? "").trim();
    const fatherName = String(body.fatherName ?? "").trim();
    const niyyahName = String(body.niyyahName ?? "").trim();
    const contactNumber = String(body.contactNumber ?? "").trim();
    const shares = Number(body.shares ?? 0);
    const paymentStatus = String(body.paymentStatus ?? "").trim().toUpperCase();
    const meatPreference = String(body.meatPreference ?? "").trim().toUpperCase();

    if (!participantName || !fatherName || !niyyahName || !contactNumber) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    if (!qurbaniShareOptions.includes(shares as (typeof qurbaniShareOptions)[number])) {
      return NextResponse.json({ error: "Shares must be between 1 and 7" }, { status: 400 });
    }

    if (!qurbaniPaymentOptions.some((option) => option.value === paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }

    if (!qurbaniMeatOptions.some((option) => option.value === meatPreference)) {
      return NextResponse.json({ error: "Invalid meat preference" }, { status: 400 });
    }

    const prisma = getPrisma();
    const created = await prisma.qurbaniSubmission.create({
      data: {
        participantName,
        fatherName,
        niyyahName,
        contactNumber,
        shares,
        totalAmount: calculateQurbaniTotal(shares),
        paymentStatus: paymentStatus as "PAID" | "PENDING",
        meatPreference: meatPreference as "RECEIVE_MEAT" | "DONATE",
      },
    });

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    console.error("QURBANI_SUBMIT_ERROR:", error);
    return NextResponse.json({ error: "Unable to submit Qurbani request" }, { status: 500 });
  }
}
