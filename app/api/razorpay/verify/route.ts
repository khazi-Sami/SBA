import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { orderId, paymentId, signature } = await req.json();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const body = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // ✅ Here you can also store donation in DB using Prisma later

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("RAZORPAY_VERIFY_ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}