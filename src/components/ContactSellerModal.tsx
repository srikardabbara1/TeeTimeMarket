"use client";

import { useState } from "react";

interface TeeTimeInfo {
  id: string;
  courseName: string;
  courseCity: string;
  courseState: string;
  contactPreference?: string;
}

interface ContactSellerModalProps {
  teeTime: TeeTimeInfo;
  onClose: () => void;
  onSent?: () => void;
}

export function ContactSellerModal({ teeTime, onClose, onSent }: ContactSellerModalProps) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError("");
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teeTimeId: teeTime.id, body: body.trim() }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error || "Failed to send message");
      return;
    }
    onSent?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact seller</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          {teeTime.courseName} — {teeTime.courseCity}, {teeTime.courseState}
        </p>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="e.g. I'd like to book 2 slots for this tee time..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
            required
          />
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={sending}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send message"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
