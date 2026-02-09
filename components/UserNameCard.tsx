"use client";

import { useEffect, useState } from "react";
import { claimReaderName, releaseReaderName, touchReaderName } from "../lib/store";

function getOrCreateClientId() {
  const existing = localStorage.getItem("readerClientId");
  if (existing) return existing;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem("readerClientId", id);
  return id;
}

export function useUserName() {
  const [name, setNameState] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("readerName");
    setNameState(stored ?? "");
    setClientId(getOrCreateClientId());
  }, []);

  useEffect(() => {
    if (!clientId || !name) return;

    void touchReaderName(name, clientId);
    const interval = setInterval(() => {
      void touchReaderName(name, clientId);
    }, 60_000);

    const onUnload = () => {
      void releaseReaderName(name, clientId);
    };

    window.addEventListener("beforeunload", onUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [clientId, name]);

  const setName = async (value: string) => {
    if (!clientId) return;

    const v = value.trim();
    if (!v) return;

    const prev = (name ?? "").trim();
    await claimReaderName(v, clientId);

    if (prev && prev !== v) {
      await releaseReaderName(prev, clientId);
    }

    setNameState(v);
    localStorage.setItem("readerName", v);
  };

  return { name, setName, ready: name !== null };
}

export function UserNameCard({ name, setName, ready }: { name: string | null; setName: (v: string) => Promise<void>; ready: boolean }) {
  async function ask() {
    const v = window.prompt("מה השם שלך?", name || "");
    if (!v) return;
    try {
      await setName(v.trim());
    } catch (e: any) {
      alert(e?.message ?? "לא הצלחתי לשמור את השם");
    }
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
