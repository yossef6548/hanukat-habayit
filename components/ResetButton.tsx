
"use client";

import { useState } from "react";
import { adminReset } from "../lib/store";

export function ResetButton() {
  const [loading, setLoading] = useState(false);

  async function onReset() {
    const pwd = window.prompt("איפוס — הזן סיסמה כדי למנוע לחיצה בטעות:");
    if (pwd == null) return;
    setLoading(true);
    try {
      await adminReset(pwd.trim());
      alert("אופס! הכל אופס בהצלחה 🙂");
    } catch (e: any) {
      alert(e?.message ?? "שגיאה באיפוס");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onReset}
      disabled={loading}
      className="mt-4 w-full rounded-2xl bg-neutral-800 px-4 py-3 text-base font-semibold text-neutral-100 shadow active:scale-[0.99] disabled:opacity-60"
    >
      {loading ? "מאפס..." : "איפוס"}
    </button>
  );
}
