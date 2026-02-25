"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  body: string;
  read: boolean;
  createdAt: string;
  sender: { name: string | null; email: string };
  teeTime: { courseName: string; courseCity: string; courseState: string; teeTime: string };
}

export default function MessagesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/messages");
      return;
    }
    if (status !== "authenticated") return;
    async function load() {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
      setLoading(false);
    }
    load();
  }, [status, router]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Inbox</h1>
      <p className="text-gray-600 mb-6">
        Messages from buyers about your tee time listings.
      </p>

      {loading ? (
        <div className="text-gray-500">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center text-gray-500">
          <p>No messages yet.</p>
          <p className="text-sm mt-2">
            When someone contacts you about a listing, it will appear here.
          </p>
          <Link href="/" className="inline-block mt-4 text-emerald-600 font-medium hover:underline">
            Back to marketplace
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li
              key={m.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <p className="font-medium text-gray-900">
                  {m.sender.name || m.sender.email}
                </p>
                <time className="text-sm text-gray-500 shrink-0">
                  {formatDate(m.createdAt)}
                </time>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Re: {m.teeTime.courseName} — {m.teeTime.courseCity}, {m.teeTime.courseState}
              </p>
              <p className="text-gray-700 whitespace-pre-wrap">{m.body}</p>
              <a
                href={`mailto:${m.sender.email}?subject=Re: Tee time - ${m.teeTime.courseName}`}
                className="inline-block mt-3 text-sm text-emerald-600 font-medium hover:underline"
              >
                Reply via email
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
