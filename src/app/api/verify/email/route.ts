import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function baseUrl(request: Request): string {
  const url = new URL(request.url);
  return url.origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const origin = baseUrl(request);

  if (!token) {
    return NextResponse.redirect(`${origin}/profile?verify=missing`);
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.redirect(`${origin}/profile?verify=expired`);
  }

  if (record.identifier) {
    await prisma.user.update({
      where: { id: record.identifier },
      data: { emailVerified: new Date() },
    });
  }

  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(`${origin}/profile?verify=email`);
}
