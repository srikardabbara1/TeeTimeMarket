"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ContactSellerModal } from "@/components/ContactSellerModal";

interface TeeTime {
  id: string;
  courseName: string;
  courseCity: string;
  courseState: string;
  teeTime: string;
  costPerSlot: number;
  slotsTotal: number;
  slotsTaken: number;
  contactPreference?: string;
  seller: { name: string | null; email: string };
}

export default function MarketplacePage() {
  const { data: session, status } = useSession();
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    golfers: "",
    city: "",
    state: "",
    course: "",
    maxDistanceMiles: "",
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [contactModalTeeTime, setContactModalTeeTime] = useState<TeeTime | null>(null);

  useEffect(() => {
    async function loadTeeTimes() {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.golfers) params.set("golfers", filters.golfers);
      if (filters.city) params.set("city", filters.city);
      if (filters.state) params.set("state", filters.state);
       if (filters.course) params.set("course", filters.course);
      const res = await fetch(`/api/tee-times?${params}`);
      const data = await res.json();
      let list: TeeTime[] = Array.isArray(data) ? data : [];

      if (userLocation && filters.maxDistanceMiles) {
        const maxMiles = parseFloat(filters.maxDistanceMiles);
        if (!Number.isNaN(maxMiles) && maxMiles > 0) {
          list = list.filter((t) => {
            if (t.courseCity == null && t.courseState == null) return true;
            // distance requires latitude/longitude; if not present, keep item
            const any = (t as any) as { latitude?: number | null; longitude?: number | null };
            if (any.latitude == null || any.longitude == null) return false;
            const d = haversineMiles(
              userLocation.lat,
              userLocation.lng,
              any.latitude,
              any.longitude
            );
            return d <= maxMiles;
          });
        }
      }

      setTeeTimes(list);
      setLoading(false);
    }
    loadTeeTimes();
  }, [filters.golfers, filters.city, filters.state, filters.course, filters.maxDistanceMiles, userLocation]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCost = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  const slotsAvailable = (t: TeeTime) => t.slotsTotal - t.slotsTaken;

  const haversineMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 3958.8; // miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation not supported in this browser.");
      return;
    }
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocationError("Unable to get your location. Please check permissions.");
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tee Time Marketplace
        </h1>
        <p className="text-gray-600">
          Browse and book tee times near you.{" "}
          {!session && (
            <Link href="/signin" className="text-emerald-600 font-medium hover:underline">
              Sign in
            </Link>
          )}{" "}
          to filter by your profile or sell tee times.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Golfers needed
            </label>
            <select
              value={filters.golfers}
              onChange={(e) =>
                setFilters((f) => ({ ...f, golfers: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "golfer" : "golfers"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) =>
                setFilters((f) => ({ ...f, city: e.target.value }))
              }
              placeholder="e.g. San Diego"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={filters.state}
              onChange={(e) =>
                setFilters((f) => ({ ...f, state: e.target.value }))
              }
              placeholder="e.g. CA"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course name
            </label>
            <input
              type="text"
              value={filters.course}
              onChange={(e) =>
                setFilters((f) => ({ ...f, course: e.target.value }))
              }
              placeholder="e.g. Pebble Beach"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
        <div className="sm:w-64 space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distance from me
          </label>
          <div className="flex gap-2">
            <select
              value={filters.maxDistanceMiles}
              onChange={(e) =>
                setFilters((f) => ({ ...f, maxDistanceMiles: e.target.value }))
              }
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="">Any</option>
              <option value="10">≤ 10 miles</option>
              <option value="25">≤ 25 miles</option>
              <option value="50">≤ 50 miles</option>
              <option value="100">≤ 100 miles</option>
            </select>
            <button
              type="button"
              onClick={requestLocation}
              className="px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 whitespace-nowrap"
            >
              Use my location
            </button>
          </div>
          {locationError && (
            <p className="text-xs text-red-600">{locationError}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading tee times...</div>
      ) : teeTimes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-600 mb-4">No tee times found matching your filters.</p>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or{" "}
            {session ? (
              <Link href="/listings/new" className="text-emerald-600 hover:underline">
                list a tee time
              </Link>
            ) : (
              <Link href="/signup" className="text-emerald-600 hover:underline">
                sign up to sell tee times
              </Link>
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teeTimes.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5"
            >
              <h3 className="font-semibold text-gray-900 mb-1">{t.courseName}</h3>
              <p className="text-sm text-gray-500 mb-3">
                {t.courseCity}, {t.courseState}
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Time:</span> {formatTime(t.teeTime)}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Cost:</span>{" "}
                  {formatCost(t.costPerSlot)} per slot
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Slots available:</span>{" "}
                  {slotsAvailable(t)} of {t.slotsTotal}
                </p>
              </div>
              {session ? (
                <button
                  type="button"
                  onClick={() => setContactModalTeeTime(t)}
                  className="mt-4 block w-full py-2.5 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition text-sm"
                >
                  Contact seller
                </button>
              ) : (
                <Link
                  href="/signin?callbackUrl=/"
                  className="mt-4 block w-full py-2.5 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition text-sm"
                >
                  Sign in to contact seller
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {contactModalTeeTime && (
        <ContactSellerModal
          teeTime={contactModalTeeTime}
          onClose={() => setContactModalTeeTime(null)}
        />
      )}
    </div>
  );
}
