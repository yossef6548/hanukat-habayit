"use client";

import { useState } from "react";

const WIFI_NAME = "Cohen";
const WIFI_PASSWORD = "yh260126";

export default function WifiInfoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(WIFI_PASSWORD);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }

    setTimeout(() => {
      setCopyStatus("idle");
    }, 2000);
  };

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-left" dir="ltr">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/70 text-neutral-200 transition hover:border-neutral-500 hover:text-white"
        aria-expanded={isOpen}
        aria-controls="wifi-details"
        aria-label="Show wifi details"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M2 8.5A15.5 15.5 0 0 1 22 8.5" strokeLinecap="round" />
          <path d="M5 12.5a11 11 0 0 1 14 0" strokeLinecap="round" />
          <path d="M8.5 16a6 6 0 0 1 7 0" strokeLinecap="round" />
          <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {isOpen && (
        <div
          id="wifi-details"
          className="mt-2 w-64 rounded-lg border border-neutral-700 bg-neutral-900/95 p-3 text-sm text-neutral-100 shadow-xl"
        >
          <div className="mb-1 font-bold" dir="rtl">
            התחבר לWI-FI
          </div>
          <div>
            <span className="text-neutral-300">Name:</span> {WIFI_NAME}
          </div>
          <div>
            <span className="text-neutral-300">Password:</span> {WIFI_PASSWORD}
          </div>
          <button
            type="button"
            onClick={copyPassword}
            className="mt-2 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-400"
          >
            {copyStatus === "copied" ? "Copied!" : copyStatus === "error" ? "Copy failed" : "Copy password"}
          </button>
        </div>
      )}
    </div>
  );
}
