import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile, user] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    }),
  ]);
  if (!profile) {
    return NextResponse.json(null);
  }
  return NextResponse.json({
    ...profile,
    emailVerified: user?.emailVerified ?? null,
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { phone, city, state, latitude, longitude } = body;

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      phone: phone || null,
      city: city || null,
      state: state || null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    },
    update: {
      phone: phone ?? null,
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
    },
  });

  return NextResponse.json(profile);
}
