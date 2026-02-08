
"use client";

import Link from "next/link";
import { Part, PARTS } from "../lib/parts";
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

function subText(state?: PartState) {
  if (!state || state.status === "available") return "פנוי";
  if (state.status === "reading") return `בקריאה: ${state.readerName ?? "מישהו"}`;
  return `נקרא: ${state.readerName ?? "מישהו"}`;
}

export function PartsList({
  stateMap,
}: {
  stateMap: Record<string, PartState>;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-neutral-900 p-3 shadow">
      <div className="mb-2 text-lg font-semibold">בחירת קטע לקריאה</div>

      <div className="max-h-[55vh] overflow-y-auto pr-1">
        <div className="space-y-2">
          {PARTS.map((p) => {
            const st = stateMap[p.id];
            const selectable = !st || st.status === "available";

            const card = (
              <div
                className={
                  "w-full rounded-2xl px-4 py-3 shadow-sm " + classFor(st) +
                  (selectable ? " active:scale-[0.99] transition" : " opacity-90")
                }
              >
                <div className="flex items-center justify-between">
                  <div className="text-base font-bold">{p.title}</div>
                  <div className="text-xs font-semibold">{subText(st)}</div>
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
