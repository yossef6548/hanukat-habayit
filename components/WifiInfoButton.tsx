"use client";

import { useState } from "react";

const WIFI_NAME = "Cohen";
const WIFI_PASSWORD = "yh260126";

export function WifiInfoButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(WIFI_PASSWORD);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="absolute left-4 top-4 rounded-xl border border-neutral-700 px-3 py-2 text-sm font-bold text-neutral-100 hover:bg-neutral-900"
        aria-expanded={open}
        aria-label="מידע רשת אלחוטית"
      >
        <span aria-hidden>📶</span>
      </button>

      {open && (
        <div className="absolute left-4 top-16 w-64 rounded-2xl border border-neutral-700 bg-neutral-900 p-3 text-right shadow-lg">
          <div className="text-sm font-extrabold">התחבר לWI-FI</div>
          <div className="mt-2 text-sm text-neutral-200">שם רשת: {WIFI_NAME}</div>
          <div className="mt-1 text-sm text-neutral-200">סיסמה: {WIFI_PASSWORD}</div>
          <button
            type="button"
            onClick={copyPassword}
            className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-sm font-bold text-neutral-900"
          >
            {copied ? "הועתק!" : "העתק סיסמה"}
          </button>
        </div>
      )}
    </>
  );
}
