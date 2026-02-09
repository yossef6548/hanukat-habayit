
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PARTS } from "../../../lib/parts";
import { cancelPart, ensureInitialized, markDone, subscribeParts, tryTakePart, PartState } from "../../../lib/store";
import { useUserName } from "../../../components/UserNameCard";

export default function PartPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { name, ready: nameReady } = useUserName();
  const part = useMemo(() => PARTS.find(p => p.id === id), [id]);
  const [state, setState] = useState<PartState | null>(null);
  const [loading, setLoading] = useState(true);
  const shouldReleaseRef = useRef(true);
  const releaseInFlightRef = useRef(false);

  const releasePart = useCallback(() => {
    if (!name || !shouldReleaseRef.current || releaseInFlightRef.current) return;
    releaseInFlightRef.current = true;
    cancelPart(id, name)
      .catch(() => {
        // best effort cleanup
      })
      .finally(() => {
        releaseInFlightRef.current = false;
      });
  }, [id, name]);

  useEffect(() => {
    if (!nameReady) return;
    if (!name) {
      alert("כדי לבחור קטע צריך קודם להגדיר שם.");
      router.replace("/");
      return;
    }
  }, [name, nameReady, router]);

  useEffect(() => {
    if (!part) return;
    if (!name) return;
    if (!nameReady) return;
    let unsub: any = null;
    (async () => {
      await ensureInitialized();
      unsub = subscribeParts((map) => {
        setState(map[id] ?? null);
      });

      try {
        await tryTakePart(id, name);
      } catch (e: any) {
        alert(e?.message ?? "לא הצלחתי לבחור את החלק");
        router.replace("/");
        return;
      } finally {
        setLoading(false);
      }
    })();

    // best-effort release if user leaves this page in any way
    const onUnload = () => releasePart();
    const onPageHide = () => releasePart();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        releasePart();
      }
    };

    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      releasePart();
      unsub?.();
    };
  }, [id, name, nameReady, part, releasePart, router]);

  if (!part) {
    return (
      <div className="rounded-2xl bg-neutral-900 p-4 shadow">
        חלק לא נמצא
      </div>
    );
  }

  return (
    <main className="space-y-4">

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
            shouldReleaseRef.current = false;
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
            shouldReleaseRef.current = false;
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
