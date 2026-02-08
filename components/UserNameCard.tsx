
"use client";

import { useEffect, useState } from "react";

export function useUserName() {
  const [name, setNameState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("readerName");
    setNameState(stored ?? "");
  }, []);

  const setName = (value: string) => {
    const v = value.trim();
    setNameState(v);
    localStorage.setItem("readerName", v);
  };

  return { name, setName, ready: name !== null };
}

export function UserNameCard({ name, setName, ready }: { name: string | null; setName: (v: string) => void; ready: boolean }) {
  function ask() {
    const v = window.prompt("מה השם שלך?", name || "");
    if (!v) return;
    setName(v.trim());
  }

  return (
    <div className="rounded-2xl bg-neutral-900 p-4 shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-neutral-300">שם משתתף</div>
          <div className="text-lg font-semibold">{ready ? name || "לא הוגדר" : "טוען..."}</div>
        </div>
        {name && ( 
          <button
            onClick={ask}
            className="rounded-2xl bg-neutral-800 px-4 py-3 text-sm font-semibold active:scale-[0.99]"
          >
            עריכה
          </button>
        )}
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
