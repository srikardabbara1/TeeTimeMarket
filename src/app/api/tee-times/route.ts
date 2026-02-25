import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
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
    costPerSlot,
    slotsTotal,
    contactPreference,
  } = body;

  if (!courseName || !courseCity || !courseState || !teeTime || costPerSlot == null || !slotsTotal) {
    return NextResponse.json(
      { error: "Missing required fields: courseName, courseCity, courseState, teeTime, costPerSlot, slotsTotal" },
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
      costPerSlot: Math.round(parseFloat(costPerSlot) * 100),
      slotsTotal: parseInt(slotsTotal, 10),
      contactPreference: preference,
      sellerId: session.user.id,
    },
  });

  return NextResponse.json(teeTimeRecord);
}
