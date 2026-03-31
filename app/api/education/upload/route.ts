import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import path from "path";
import { promises as fs } from "fs";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only teachers can upload files" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const relDir = path.join("uploads", "recordings");
  const absDir = path.join(process.cwd(), "public", relDir);
  const absPath = path.join(absDir, safeName);

  await fs.mkdir(absDir, { recursive: true });
  await fs.writeFile(absPath, buffer);

  return NextResponse.json({ url: `/${relDir.replace(/\\/g, "/")}/${safeName}` }, { status: 201 });
}
