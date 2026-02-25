import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { email, password, name, phone } = body as Record<string, unknown>;

  const emailStr = typeof email === "string" ? email.trim() : "";
  const passwordStr = typeof password === "string" ? password : "";
  const nameStr = typeof name === "string" ? name.trim() : "";
  const phoneStr = typeof phone === "string" ? phone.trim() : "";

  if (!emailStr || !passwordStr) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (!nameStr) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  const hasPhone = phoneStr.length > 0;

  try {
    const existing = await prisma.user.findUnique({
      where: { email: emailStr },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(passwordStr, 12);
    const user = await prisma.user.create({
      data: {
        email: emailStr,
        password: hashed,
        name: nameStr,
      },
    });

    await prisma.profile.create({
      data: {
        userId: user.id,
        phone: hasPhone ? phoneStr : null,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errObj = error && typeof error === "object" ? (error as { code?: string }) : null;
    console.error("Signup error:", error);
    const payload: { error: string; detail?: string; code?: string } = {
      error: "Something went wrong",
    };
    if (process.env.NODE_ENV === "development") {
      payload.detail = message;
      if (errObj?.code) payload.code = errObj.code;
    }
    return NextResponse.json(payload, { status: 500 });
  }
}
