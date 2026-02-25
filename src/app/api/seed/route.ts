import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not in production" }, { status: 403 });
  }

  await prisma.profile.deleteMany();
  await prisma.teeTime.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const hashed = await bcrypt.hash("password123", 12);
  const seller = await prisma.user.create({
    data: {
      email: "seller@example.com",
      password: hashed,
      name: "Demo Seller",
    },
  });

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  const courses = [
    { name: "Pebble Beach Golf Links", city: "Pebble Beach", state: "CA", lat: 36.5674, lng: -121.95 },
    { name: "Torrey Pines South", city: "San Diego", state: "CA", lat: 32.8384, lng: -117.257 },
    { name: "Bethpage Black", city: "Farmingdale", state: "NY", lat: 40.7445, lng: -73.4753 },
    { name: "TPC Sawgrass", city: "Ponte Vedra Beach", state: "FL", lat: 30.1973, lng: -81.3958 },
    { name: "Pinehurst No. 2", city: "Pinehurst", state: "NC", lat: 35.1954, lng: -79.4694 },
  ];

  for (let d = 0; d < 7; d++) {
    for (const course of courses) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + d);
      for (let h = 7; h <= 14; h += 2) {
        const teeTime = new Date(date);
        teeTime.setHours(h, 0, 0, 0);
        await prisma.teeTime.create({
          data: {
            courseName: course.name,
            courseCity: course.city,
            courseState: course.state,
            latitude: course.lat,
            longitude: course.lng,
            teeTime,
            costPerSlot: Math.floor(4000 + Math.random() * 6000),
            slotsTotal: 4,
            slotsTaken: Math.floor(Math.random() * 2),
            sellerId: seller.id,
          },
        });
      }
    }
  }

  return NextResponse.json({ ok: true, message: "Seed complete. Login: seller@example.com / password123" });
}
