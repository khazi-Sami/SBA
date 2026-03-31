import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amountRupees = Number(body.amount);

    if (!amountRupees || amountRupees < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amountRupees * 100), // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        causeId: body.causeId ?? "",
        causeTitle: body.causeTitle ?? "",
        donorName: body.name ?? "",
        donorEmail: body.email ?? "",
        donorPhone: body.phone ?? "",
      },
    });

    return NextResponse.json({
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (e) {
    console.error("RAZORPAY_ORDER_ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}