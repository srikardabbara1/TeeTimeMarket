"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewListingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    courseName: "",
    courseCity: "",
    courseState: "",
    teeTime: "",
    coursePricePerSlot: "",
    sellerPricePerSlot: "",
    slotsTotal: "4",
    contactPreference: "website",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/listings/new");
    }
  }, [status, router]);

  if (status === "unauthenticated") {
    router.push("/signin?callbackUrl=/listings/new");
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-500">
        Redirecting to sign in...
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/tee-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseName: form.courseName,
        courseCity: form.courseCity,
        courseState: form.courseState,
        teeTime: form.teeTime,
        coursePricePerSlot: parseFloat(form.coursePricePerSlot),
        sellerPricePerSlot: parseFloat(form.sellerPricePerSlot),
        slotsTotal: parseInt(form.slotsTotal, 10),
        contactPreference: form.contactPreference,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    router.push("/");
    router.refresh();
  }

  const today = new Date().toISOString().slice(0, 16);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sell a tee time</h1>
        <p className="text-gray-600">
          List your tee time for other golfers to purchase.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6"
      >
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course name
          </label>
          <input
            type="text"
            value={form.courseName}
            onChange={(e) => setForm((f) => ({ ...f, courseName: e.target.value }))}
            placeholder="e.g. Pebble Beach Golf Links"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={form.courseCity}
              onChange={(e) => setForm((f) => ({ ...f, courseCity: e.target.value }))}
              placeholder="e.g. Pebble Beach"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={form.courseState}
              onChange={(e) => setForm((f) => ({ ...f, courseState: e.target.value }))}
              placeholder="e.g. CA"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date & time
          </label>
          <input
            type="datetime-local"
            value={form.teeTime}
            onChange={(e) => setForm((f) => ({ ...f, teeTime: e.target.value }))}
            min={today}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            required
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course price per slot ($)
            </label>
            <p className="text-xs text-gray-500 mb-1">
              What the golf course charges for this tee time.
            </p>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.coursePricePerSlot}
              onChange={(e) =>
                setForm((f) => ({ ...f, coursePricePerSlot: e.target.value }))
              }
              placeholder="e.g. 75.00"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your price per slot ($)
            </label>
            <p className="text-xs text-gray-500 mb-1">
              What the buyer pays you for the slot.
            </p>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.sellerPricePerSlot}
              onChange={(e) =>
                setForm((f) => ({ ...f, sellerPricePerSlot: e.target.value }))
              }
              placeholder="e.g. 100.00"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total slots
            </label>
            <select
              value={form.slotsTotal}
              onChange={(e) =>
                setForm((f) => ({ ...f, slotsTotal: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            How do you want to be contacted?
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Buyers will send a message on the site; you’ll be notified by your choice below.
          </p>
          <select
            value={form.contactPreference}
            onChange={(e) =>
              setForm((f) => ({ ...f, contactPreference: e.target.value }))
            }
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="email">Email</option>
            <option value="phone">Phone (SMS)</option>
            <option value="website">Website only (inbox)</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Listing..." : "List tee time"}
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
