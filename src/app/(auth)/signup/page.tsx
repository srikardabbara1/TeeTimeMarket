"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function closeTerms() {
    if (termsAccepted) setTermsOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim(),
          phone: phone.trim() || undefined,
        }),
      });
      let data: { error?: string; detail?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError(res.ok ? "Invalid response from server" : `Sign up failed (${res.status})`);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const msg = data.detail ? `${data.error}: ${data.detail}` : (data.error || "Something went wrong");
        setError(msg);
        setLoading(false);
        return;
      }
      setLoading(false);
      window.location.href = "/signin?registered=1";
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50/50 px-4 py-8">
      {termsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={(e) => e.target === e.currentTarget && closeTerms()}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 overflow-y-auto flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Terms and Conditions</h2>
              <div className="space-y-4 text-sm text-gray-700">
                <section>
                  <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
                  <p>
                    TeeTime works on a one strike policy. Any attempt to fabricate tee times or sell non-existent tee times will result in an immediate platform ban and report of fraud. Please only list tee times you have a claim to and can no longer attend.
                  </p>
                </section>
                <section>
                  <h3 className="font-semibold text-gray-900 mb-2">Selling a tee time</h3>
                  <p>
                    If you have a booked tee time you&apos;d like to list on the Marketplace, list the cost of the tee time and then the price you are charging for that slot. You can find instructions on how to sell a tee time{" "}
                    <Link href="/listings/new" className="text-emerald-600 font-medium hover:underline">
                      here
                    </Link>
                    .
                  </p>
                  <p className="mt-2">
                    When selling a tee time, remember: the price of the tee time is what the golf course is charging; your price is what you will receive for selling a premium tee time.
                  </p>
                </section>
                <section>
                  <h3 className="font-semibold text-gray-900 mb-2">Buying a tee time</h3>
                  <p>
                    Message the seller directly on our site. Their price and the price of the tee time will be listed.
                  </p>
                  <p className="mt-2 font-medium text-amber-800 bg-amber-50 p-2 rounded">
                    REMEMBER: The price of the tee time is what you pay at the course. The seller price is the price of buying the tee time from the seller.
                  </p>
                </section>
                <section>
                  <p>
                    TeeTime does not hold accountability for any mistaken purchases or cancellations. Once a purchase is complete, the owner of that tee time is responsible for all charges and fees.
                  </p>
                </section>
              </div>
              <label className="mt-4 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm">I acknowledge all terms and conditions.</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                type="button"
                onClick={closeTerms}
                disabled={!termsAccepted}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <span className="text-2xl font-bold text-emerald-800">⛳ TeeTimeMarket</span>
        </Link>
        <div className="bg-white rounded-2xl shadow-xl shadow-emerald-100/50 p-8 border border-emerald-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone number (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="e.g. (555) 123-4567"
              />
              <p className="mt-1 text-xs text-gray-500">
                Add a phone number for text notifications when a buyer contacts you!
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/signin" className="text-emerald-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
