import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: { identifier: session.user.id },
  });
  await prisma.verificationToken.create({
    data: {
      identifier: session.user.id,
      token,
      expires,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/api/verify/email?token=${token}`;

  const result = await sendVerificationEmail({
    toEmail: session.user.email,
    verifyUrl,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Failed to send verification email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
