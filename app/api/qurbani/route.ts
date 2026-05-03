import { NextResponse } from "next/server";
import {
  calculateQurbaniTotal,
  qurbaniMeatOptions,
  qurbaniPaymentOptions,
  qurbaniShareOptions,
  normalizeIndianPhoneNumber,
  validateQurbaniSubmissionFields,
} from "@/lib/qurbani";
import {
  createQurbaniSubmissions,
  deleteQurbaniSubmission,
  updateQurbaniSubmission,
} from "@/lib/qurbani-store";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const participantName = String(body.participantName ?? "").trim();
    const fatherName = String(body.fatherName ?? "").trim();
    const niyyahName = String(body.niyyahName ?? "").trim();
    const contactNumber = normalizeIndianPhoneNumber(String(body.contactNumber ?? "").trim());
    const addressLocation = String(body.addressLocation ?? "").trim();
    const shares = Number(body.shares ?? 0);
    const paymentStatus = String(body.paymentStatus ?? "").trim().toUpperCase();
    const meatPreference = String(body.meatPreference ?? "").trim().toUpperCase();

    const validationError = validateQurbaniSubmissionFields({
      participantName,
      fatherName,
      niyyahName,
      contactNumber,
      addressLocation,
    });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
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

    const created = await createQurbaniSubmissions({
      participantName,
      fatherName,
      niyyahName,
      contactNumber,
      addressLocation,
      shares,
      totalAmount: calculateQurbaniTotal(shares),
      paymentStatus: paymentStatus as "PAID" | "PENDING",
      meatPreference: meatPreference as "RECEIVE_MEAT" | "DONATE",
    });

    return NextResponse.json(
      { ok: true, count: created.length, ids: created.map((entry) => entry.id) },
      { status: 201 }
    );
  } catch (error) {
    console.error("QURBANI_SUBMIT_ERROR:", error);
    return NextResponse.json({ error: "Unable to submit Qurbani request" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const id = String(body.id ?? "").trim();
    const participantName = String(body.participantName ?? "").trim();
    const fatherName = String(body.fatherName ?? "").trim();
    const niyyahName = String(body.niyyahName ?? "").trim();
    const contactNumber = normalizeIndianPhoneNumber(String(body.contactNumber ?? "").trim());
    const addressLocation = String(body.addressLocation ?? "").trim();
    const paymentStatus = String(body.paymentStatus ?? "").trim().toUpperCase();
    const meatPreference = String(body.meatPreference ?? "").trim().toUpperCase();

    if (!id) {
      return NextResponse.json({ error: "Submission id is required" }, { status: 400 });
    }

    const validationError = validateQurbaniSubmissionFields({
      participantName,
      fatherName,
      niyyahName,
      contactNumber,
      addressLocation,
    });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (!qurbaniPaymentOptions.some((option) => option.value === paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }

    if (!qurbaniMeatOptions.some((option) => option.value === meatPreference)) {
      return NextResponse.json({ error: "Invalid meat preference" }, { status: 400 });
    }

    const updated = await updateQurbaniSubmission({
      id,
      participantName,
      fatherName,
      niyyahName,
      contactNumber,
      addressLocation,
      paymentStatus: paymentStatus as "PAID" | "PENDING",
      meatPreference: meatPreference as "RECEIVE_MEAT" | "DONATE",
    });

    return NextResponse.json({ ok: true, submission: updated });
  } catch (error) {
    console.error("QURBANI_UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Unable to update Qurbani request" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const id = String(body.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "Submission id is required" }, { status: 400 });
    }

    await deleteQurbaniSubmission({ id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("QURBANI_DELETE_ERROR:", error);
    return NextResponse.json({ error: "Unable to delete Qurbani request" }, { status: 500 });
  }
}
