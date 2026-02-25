import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.phone?.trim()) {
    return NextResponse.json(
      { error: "Add a phone number in your profile first." },
      { status: 400 }
    );
  }

  const code = generateCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      phoneVerificationCode: code,
      phoneVerificationExpires: expires,
    },
  });

  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioAccountSid && twilioAuthToken && twilioFrom) {
    const phone = profile.phone.replace(/\D/g, "");
    const to = phone.length === 10 ? `+1${phone}` : phone.startsWith("+") ? phone : `+${phone}`;
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64"),
        },
        body: new URLSearchParams({
          To: to,
          From: twilioFrom,
          Body: `Your TeeTimeMarket verification code is: ${code}. It expires in 10 minutes.`,
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      console.error("Twilio error:", err);
      return NextResponse.json(
        { error: "Failed to send SMS. Check your phone number." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
