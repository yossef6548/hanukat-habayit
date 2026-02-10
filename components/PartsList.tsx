
"use client";

import Link from "next/link";
import { PARTS } from "../lib/parts";
import { PartState } from "../lib/store";

function classFor(state?: PartState) {
  if (!state || state.status === "available") {
    return "bg-white text-neutral-900";
  }
  if (state.status === "reading") {
    return "bg-orange-500 text-neutral-900";
  }
  return "bg-green-500 text-neutral-900";
}

function subText(state?: PartState, blocked?: boolean) {
  if (!state || state.status === "available") {
    return blocked ? "ממתין לחלק הקודם" : "פנוי";
  }
  if (state.status === "reading") return `בקריאה: ${state.readerName ?? "מישהו"}`;
  return `נקרא: ${state.readerName ?? "מישהו"}`;
}


function sameReader(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  return a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();
}

function isUnlocked(stateMap: Record<string, PartState>, index: number) {
  if (index === 0) return true;
  const prev = stateMap[PARTS[index - 1].id];
  return prev?.status === "done";
}

export function PartsList({
  stateMap,
  currentUserName,
}: {
  stateMap: Record<string, PartState>;
  currentUserName?: string | null;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-neutral-900 p-3 shadow">
      <div className="mb-2 text-lg font-semibold">בחירת קטע לקריאה</div>

      <div className="pr-1">
        <div className="space-y-2">
          {PARTS.map((p, index) => {
            const st = stateMap[p.id];
            const unlocked = isUnlocked(stateMap, index);
            const selectable = unlocked && (
              !st ||
              st.status === "available" ||
              (st.status === "reading" && sameReader(st.readerName, currentUserName))
            );

            const card = (
              <div
                className={
                  "w-full rounded-2xl px-4 py-3 shadow-sm " + classFor(st) +
                  (selectable ? " active:scale-[0.99] transition" : " opacity-90")
                }
              >
                <div className="flex items-center justify-between">
                  <div className="text-base font-bold">{p.title}</div>
                  <div className="text-xs font-semibold">{subText(st, !unlocked && (!st || st.status === "available"))}</div>
                </div>
              </div>
            );

            if (!selectable) return <div key={p.id}>{card}</div>;

            return (
              <Link key={p.id} href={`/part/${p.id}`} className="block">
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
