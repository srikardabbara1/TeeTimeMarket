import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const code = body?.code?.trim();

  if (!code) {
    return NextResponse.json(
      { error: "Verification code is required" },
      { status: 400 }
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (
    !profile.phoneVerificationCode ||
    !profile.phoneVerificationExpires ||
    profile.phoneVerificationExpires < new Date()
  ) {
    return NextResponse.json(
      { error: "Code expired or not requested. Request a new code." },
      { status: 400 }
    );
  }

  if (profile.phoneVerificationCode !== code) {
    return NextResponse.json(
      { error: "Invalid verification code" },
      { status: 400 }
    );
  }

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      phoneVerifiedAt: new Date(),
      phoneVerificationCode: null,
      phoneVerificationExpires: null,
    },
  });

  return NextResponse.json({ ok: true });
}
