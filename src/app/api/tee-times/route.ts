import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const golfers = searchParams.get("golfers");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const course = searchParams.get("course");

    const teeTimes = await prisma.teeTime.findMany({
      where: {
        ...(golfers && { slotsTotal: { gte: parseInt(golfers, 10) } }),
        ...(state && { courseState: { contains: state, mode: "insensitive" } }),
        ...(city && { courseCity: { contains: city, mode: "insensitive" } }),
        ...(course && { courseName: { contains: course, mode: "insensitive" } }),
      },
      include: {
        seller: { select: { name: true, email: true } },
      },
      orderBy: { teeTime: "asc" },
      take: 100,
    });

    const withAvailable = teeTimes.filter((t) => t.slotsTotal > t.slotsTaken);
    return NextResponse.json(withAvailable);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to load tee times: ${message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    courseName,
    courseCity,
    courseState,
    latitude,
    longitude,
    teeTime,
    coursePricePerSlot,
    sellerPricePerSlot,
    slotsTotal,
    contactPreference,
  } = body;

  if (!courseName || !courseCity || !courseState || !teeTime || coursePricePerSlot == null || sellerPricePerSlot == null || !slotsTotal) {
    return NextResponse.json(
      { error: "Missing required fields: courseName, courseCity, courseState, teeTime, coursePricePerSlot, sellerPricePerSlot, slotsTotal" },
      { status: 400 }
    );
  }

  const preference = ["email", "phone", "website"].includes(contactPreference)
    ? contactPreference
    : "website";

  const teeTimeRecord = await prisma.teeTime.create({
    data: {
      courseName,
      courseCity,
      courseState,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      teeTime: new Date(teeTime),
      coursePricePerSlot: Math.round(parseFloat(coursePricePerSlot) * 100),
      sellerPricePerSlot: Math.round(parseFloat(sellerPricePerSlot) * 100),
      slotsTotal: parseInt(slotsTotal, 10),
      contactPreference: preference,
      sellerId: session.user.id,
    },
  });

  return NextResponse.json(teeTimeRecord);
}
