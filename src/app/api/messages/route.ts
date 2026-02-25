import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendTeeTimeMessageNotification } from "@/lib/email";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: { recipientId: session.user.id },
    include: {
      sender: { select: { name: true, email: true } },
      teeTime: { select: { courseName: true, courseCity: true, courseState: true, teeTime: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { teeTimeId, body: messageBody } = body;

  if (!teeTimeId || !messageBody || typeof messageBody !== "string" || messageBody.trim().length === 0) {
    return NextResponse.json(
      { error: "teeTimeId and message body are required" },
      { status: 400 }
    );
  }

  const teeTime = await prisma.teeTime.findUnique({
    where: { id: teeTimeId },
    include: {
      seller: { include: { profile: true } },
    },
  });

  if (!teeTime) {
    return NextResponse.json({ error: "Tee time not found" }, { status: 404 });
  }
  if (teeTime.sellerId === session.user.id) {
    return NextResponse.json({ error: "You cannot message yourself" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      recipientId: teeTime.sellerId,
      teeTimeId,
      body: messageBody.trim(),
    },
    include: {
      sender: { select: { name: true, email: true } },
      teeTime: { select: { courseName: true } },
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "http://localhost:3000";
  const inboxUrl = `${baseUrl}/messages`;

  const preference = teeTime.contactPreference || "website";
  const sellerEmail = teeTime.seller.email;
  const sellerName = teeTime.seller.name;
  const senderName = session.user.name || session.user.email || "A buyer";

  if (preference === "email" && sellerEmail) {
    await sendTeeTimeMessageNotification({
      toEmail: sellerEmail,
      toName: sellerName,
      courseName: teeTime.courseName,
      senderName,
      messageBody: messageBody.trim(),
      inboxUrl,
    });
  }

  if (preference === "phone" && teeTime.seller.profile?.phone) {
    // SMS would go here (e.g. Twilio). For now send email so seller is notified.
    if (sellerEmail) {
      await sendTeeTimeMessageNotification({
        toEmail: sellerEmail,
        toName: sellerName,
        courseName: teeTime.courseName,
        senderName,
        messageBody: messageBody.trim(),
        inboxUrl,
      });
    }
  }

  return NextResponse.json(message);
}
