
"use client";

import { useEffect, useState } from "react";

export function useUserName() {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("readerName");
    if (stored) setName(stored);
  }, []);

  useEffect(() => {
    if (name) localStorage.setItem("readerName", name);
  }, [name]);

  return { name, setName };
}

export function UserNameCard({ name, setName }: { name: string; setName: (v: string) => void }) {
  function ask() {
    const v = window.prompt("מה השם שלך? (יופיע ליד 'בקריאה/נקרא')", name || "");
    if (!v) return;
    setName(v.trim());
  }

  return (
    <div className="rounded-2xl bg-neutral-900 p-4 shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-neutral-300">שם משתתף</div>
          <div className="text-lg font-semibold">{name || "לא הוגדר"}</div>
        </div>
        <button
          onClick={ask}
          className="rounded-2xl bg-neutral-800 px-4 py-3 text-sm font-semibold active:scale-[0.99]"
        >
          עריכה
        </button>
      </div>
      {!name && (
        <button
          onClick={ask}
          className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-base font-bold text-neutral-900 active:scale-[0.99]"
        >
          הגדר שם כדי להתחיל
        </button>
      )}
    </div>
  );
}
