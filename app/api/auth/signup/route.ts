import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const name = (body.name ?? "").toString().trim();
    const email = (body.email ?? "").toString().trim().toLowerCase();
    const password = (body.password ?? "").toString();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already used" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name: name || null, email, password: hash },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("SIGNUP_ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
