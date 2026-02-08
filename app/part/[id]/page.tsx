
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PARTS } from "../../../lib/parts";
import { cancelPart, ensureInitialized, markDone, subscribeParts, tryTakePart, PartState } from "../../../lib/store";
import { useUserName } from "../../../components/UserNameCard";

export default function PartPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { name } = useUserName();
  const part = useMemo(() => PARTS.find(p => p.id === id), [id]);
  const [state, setState] = useState<PartState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) {
      alert("כדי לבחור קטע צריך קודם להגדיר שם.");
      router.replace("/");
      return;
    }
  }, [name, router]);

  useEffect(() => {
    let unsub: any = null;
    (async () => {
      await ensureInitialized();
      unsub = subscribeParts((map) => {
        setState(map[id] ?? null);
      });

      try {
        await tryTakePart(id, name || "אורח");
      } catch (e: any) {
        alert(e?.message ?? "לא הצלחתי לבחור את החלק");
        router.replace("/");
        return;
      } finally {
        setLoading(false);
      }
    })();

    // best-effort release on unload if still reading by me
    const onUnload = () => {
      try {
        if (name) cancelPart(id, name);
      } catch {}
    };
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      unsub?.();
    };
  }, [id, name, router]);

  if (!part) {
    return (
      <div className="rounded-2xl bg-neutral-900 p-4 shadow">
        חלק לא נמצא
      </div>
    );
  }

  return (
    <main className="space-y-4">
      <button
        onClick={() => router.push("/")}
        className="w-full rounded-2xl bg-neutral-800 px-4 py-3 text-base font-semibold active:scale-[0.99]"
      >
        ← חזרה לרשימה
      </button>

      <div className="rounded-2xl bg-neutral-900 p-4 shadow">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xl font-extrabold">{part.title}</div>
          <div className="text-xs text-neutral-400">
            {state?.status === "reading" ? `בקריאה: ${state.readerName ?? ""}` : ""}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap leading-7 text-[1.05rem] text-neutral-100">
          {part.content}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={async () => {
            if (!name) return;
            await cancelPart(id, name);
            router.push("/");
          }}
          className="rounded-2xl bg-white px-4 py-4 text-base font-extrabold text-neutral-900 active:scale-[0.99]"
        >
          ביטול
        </button>
        <button
          onClick={async () => {
            if (!name) return;
            await markDone(id, name);
            router.push("/");
          }}
          className="rounded-2xl bg-green-500 px-4 py-4 text-base font-extrabold text-neutral-900 active:scale-[0.99]"
        >
          קראתי
        </button>
      </div>

      {loading && (
        <div className="text-center text-sm text-neutral-400">מעדכן מצב...</div>
      )}
    </main>
  );
}
