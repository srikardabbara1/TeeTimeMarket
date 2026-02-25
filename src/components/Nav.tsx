"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Nav() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-emerald-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-emerald-800 hover:text-emerald-700">
          ⛳ TeeTimeMarket
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-600 hover:text-emerald-600 font-medium transition"
          >
            Marketplace
          </Link>
          {status === "loading" ? (
            <span className="text-gray-400 text-sm">...</span>
          ) : session ? (
            <>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-emerald-600 font-medium transition"
              >
                Profile
              </Link>
              <Link
                href="/messages"
                className="text-gray-600 hover:text-emerald-600 font-medium transition"
              >
                Inbox
              </Link>
              <Link
                href="/listings/new"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition"
              >
                Sell a Tee Time
              </Link>
              <button
                onClick={() => signOut()}
                className="text-gray-500 hover:text-red-600 text-sm transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-gray-600 hover:text-emerald-600 font-medium transition"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
