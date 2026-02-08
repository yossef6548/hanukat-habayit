
"use client";

import { useEffect, useMemo, useState } from "react";
import { PieProgress } from "../components/PieProgress";
import { PartsList } from "../components/PartsList";
import { ResetButton } from "../components/ResetButton";
import { UserNameCard, useUserName } from "../components/UserNameCard";
import { ensureInitialized, subscribeParts, PartState } from "../lib/store";
import { PARTS } from "../lib/parts";

export default function HomePage() {
  const { name, setName } = useUserName();
  const [stateMap, setStateMap] = useState<Record<string, PartState>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsub: any = null;
    (async () => {
      await ensureInitialized();
      unsub = subscribeParts((map) => {
        setStateMap(map);
        setReady(true);
      });
    })();
    return () => unsub?.();
  }, []);

  const counts = useMemo(() => {
    let available = 0, reading = 0, done = 0;
    for (const p of PARTS) {
      const st = stateMap[p.id];
      if (!st || st.status === "available") available++;
      else if (st.status === "reading") reading++;
      else done++;
    }
    return { available, reading, done };
  }, [stateMap]);

  return (
    <main className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-extrabold">חנוכת הבית</div>
        <div className="text-neutral-300">יוסף & הודיה</div>
      </div>

      <UserNameCard name={name} setName={setName} />

      <PieProgress available={counts.available} reading={counts.reading} done={counts.done} />

      {!ready && (
        <div className="rounded-2xl bg-neutral-900 p-4 text-center text-neutral-300 shadow">
          טוען מצב משותף...
        </div>
      )}

      <div className={name ? "" : "opacity-60 pointer-events-none"}>
        <PartsList stateMap={stateMap} />
      </div>

      <ResetButton />

      <div className="pt-2 text-center text-xs text-neutral-500">
        טיפ: אם מישהו "נתקע" על כתום, אחרי ~12 דקות זה משתחרר אוטומטית.
      </div>
    </main>
  );
}
