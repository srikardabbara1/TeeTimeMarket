"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState({
    email: "",
    phone: "",
    city: "",
    state: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [phoneVerifiedAt, setPhoneVerifiedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneVerifying, setPhoneVerifying] = useState(false);

  useEffect(() => {
    const v = searchParams.get("verify");
    if (v === "email") setVerifyMessage("Email verified.");
    if (v === "expired") setVerifyMessage("Verification link expired. Request a new one.");
    if (v === "missing") setVerifyMessage("Invalid verification link.");
    if (v) {
      window.history.replaceState({}, "", "/profile");
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/profile");
      return;
    }
    if (status !== "authenticated" || !session?.user?.email) return;
    async function load() {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data) {
        setProfile((p) => ({
          ...p,
          email: session?.user?.email ?? "",
          phone: data.phone ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
        }));
        setEmailVerified(!!data.emailVerified);
        setPhoneVerifiedAt(data.phoneVerifiedAt ?? null);
      } else if (session?.user?.email) {
        setProfile((p) => ({ ...p, email: session.user.email ?? "" }));
      }
    }
    load();
  }, [status, session?.user?.email, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: profile.phone || undefined,
        city: profile.city || undefined,
        state: profile.state || undefined,
        latitude: profile.latitude ?? undefined,
        longitude: profile.longitude ?? undefined,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  function useCurrentLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setProfile((p) => ({
            ...p,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          )
            .then((r) => r.json())
            .then((data) => {
              const city = data.address?.city || data.address?.town || data.address?.village || "";
              const state = data.address?.state || "";
              setProfile((p) => ({
                ...p,
                city,
                state,
              }));
            });
        },
        () => {}
      );
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  async function requestEmailVerification() {
    setEmailSending(true);
    const res = await fetch("/api/verify/email/request", { method: "POST" });
    setEmailSending(false);
    if (res.ok) {
      setVerifyMessage("Check your email for the verification link.");
    } else {
      const d = await res.json();
      setVerifyMessage(d.error || "Failed to send email.");
    }
  }

  async function requestPhoneCode() {
    setPhoneSending(true);
    setVerifyMessage(null);
    const res = await fetch("/api/verify/phone/request", { method: "POST" });
    setPhoneSending(false);
    if (res.ok) {
      setVerifyMessage("Check your phone for the 6-digit code.");
    } else {
      const d = await res.json();
      setVerifyMessage(d.error || "Failed to send code.");
    }
  }

  async function submitPhoneCode(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneCode.trim()) return;
    setPhoneVerifying(true);
    setVerifyMessage(null);
    const res = await fetch("/api/verify/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: phoneCode.trim() }),
    });
    const data = await res.json();
    setPhoneVerifying(false);
    if (res.ok) {
      setPhoneVerifiedAt(new Date().toISOString());
      setPhoneCode("");
      setVerifyMessage("Phone verified.");
    } else {
      setVerifyMessage(data.error || "Invalid code.");
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
        <p className="text-gray-600">
          Add your location and preferences. Provide at least one contact method: email and/or phone.
        </p>
      </div>

      {verifyMessage && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm border border-emerald-200">
          {verifyMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact info</h2>
          <p className="text-sm text-gray-500 mb-2">
            Provide at least one so buyers can reach you: email and/or phone.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600"
                  title="Email is set by your account"
                />
                {emailVerified ? (
                  <span className="text-emerald-600 text-sm font-medium shrink-0">Verified</span>
                ) : (
                  <button
                    type="button"
                    onClick={requestEmailVerification}
                    disabled={emailSending}
                    className="shrink-0 px-3 py-2 text-sm border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 disabled:opacity-50"
                  >
                    {emailSending ? "Sending…" : "Verify"}
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone number (optional)
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="e.g. (555) 123-4567"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              {profile.phone && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {phoneVerifiedAt ? (
                    <span className="text-emerald-600 text-sm font-medium">Verified</span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={requestPhoneCode}
                        disabled={phoneSending}
                        className="px-3 py-1.5 text-sm border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 disabled:opacity-50"
                      >
                        {phoneSending ? "Sending…" : "Send code"}
                      </button>
                      <form onSubmit={submitPhoneCode} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="Code"
                          className="w-20 px-2 py-1.5 rounded border border-gray-200 text-sm"
                          maxLength={6}
                        />
                        <button
                          type="submit"
                          disabled={phoneVerifying || phoneCode.length !== 6}
                          className="text-sm text-emerald-600 hover:underline disabled:opacity-50"
                        >
                          Verify
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={profile.city}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, city: e.target.value }))
                }
                placeholder="City"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <input
                type="text"
                value={profile.state}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, state: e.target.value }))
                }
                placeholder="State (e.g. CA)"
                className="w-24 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={useCurrentLocation}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Use my current location
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
          {saved && (
            <span className="text-emerald-600 font-medium self-center">
              Profile saved!
            </span>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-gray-500 text-sm">
        <Link href="/" className="text-emerald-600 hover:underline">
          Back to marketplace
        </Link>
      </p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
