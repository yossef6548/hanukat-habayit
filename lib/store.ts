
"use client";

import { db } from "./firebase";
import { PARTS, TEXT_VERSION } from "./parts";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  Timestamp,
  query,
  where,
} from "firebase/firestore";

export type PartStatus = "available" | "reading" | "done";

export type PartState = {
  id: string;
  status: PartStatus;
  readerName?: string | null;
  updatedAt?: any;
  readAt?: any;
};

const META_DOC = doc(db, "app", "meta");
const partsCol = collection(db, "parts");

function getPreviousPartId(partId: string): string | null {
  const idx = PARTS.findIndex((p) => p.id === partId);
  if (idx < 0) return null;
  if (idx === 0) return null;
  return PARTS[idx - 1].id;
}

export async function ensureInitialized() {
  const metaSnap = await getDoc(META_DOC);
  if (metaSnap.exists()) {
    const data = metaSnap.data() as any;
    if (data?.textVersion === TEXT_VERSION && data?.partsCount === PARTS.length) return;
  }

  const batch = writeBatch(db);

  // meta
  batch.set(META_DOC, {
    textVersion: TEXT_VERSION,
    partsCount: PARTS.length,
    updatedAt: serverTimestamp(),
  });

  // parts docs
  for (const p of PARTS) {
    batch.set(doc(partsCol, p.id), {
      status: "available",
      readerName: null,
      updatedAt: serverTimestamp(),
      readAt: null,
    });
  }

  await batch.commit();
}

export function subscribeParts(cb: (map: Record<string, PartState>) => void) {
  return onSnapshot(partsCol, (snap) => {
    const map: Record<string, PartState> = {};
    snap.forEach((d) => (map[d.id] = { id: d.id, ...(d.data() as any) }));
    cb(map);
  });
}

const STALE_MINUTES = 12;

function isStaleReading(state?: PartState) {
  if (!state || state.status !== "reading") return false;
  const ts: Timestamp | undefined = state.updatedAt;
  if (!ts?.toDate) return false;
  const ageMs = Date.now() - ts.toDate().getTime();
  return ageMs > STALE_MINUTES * 60_000;
}

export async function tryTakePart(partId: string, readerName: string) {
  const ref = doc(partsCol, partId);

  // prevent two active readers with the same name
  const activeByName = await getDocs(
    query(partsCol, where("status", "==", "reading"), where("readerName", "==", readerName))
  );
  const takenByOtherPart = activeByName.docs.some((d) => d.id !== partId);
  if (takenByOtherPart) {
    throw new Error("השם הזה כבר בשימוש כרגע. בחרו שם אחר.");
  }

  await runTransaction(db, async (tx) => {
    const previousPartId = getPreviousPartId(partId);
    if (previousPartId) {
      const prevRef = doc(partsCol, previousPartId);
      const prevSnap = await tx.get(prevRef);
      if (!prevSnap.exists()) throw new Error("החלק הקודם לא קיים");
      const prevData = prevSnap.data() as any;
      if (prevData.status !== "done") {
        throw new Error("החלק הזה עדיין לא זמין. צריך לסיים קודם את החלק שלפניו.");
      }
    }

    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("החלק לא קיים");
    const data = snap.data() as any;

    const state: PartState = { id: partId, ...(data as any) };

    // Auto-release stale reading
    if (isStaleReading(state)) {
      tx.set(ref, {
        status: "available",
        readerName: null,
        updatedAt: serverTimestamp(),
        readAt: null,
      }, { merge: true });
    }

    const snap2 = await tx.get(ref);
    const d2 = snap2.data() as any;
    const takenBySameReader = d2.status === "reading" && d2.readerName === readerName;
    if (d2.status !== "available" && !takenBySameReader) {
      throw new Error("החלק כבר נבחר ע\"י מישהו אחר");
    }

    if (takenBySameReader) return;

    tx.set(ref, {
      status: "reading",
      readerName,
      updatedAt: serverTimestamp(),
      readAt: null,
    }, { merge: true });
  });
}

export async function cancelPart(partId: string, readerName: string) {
  const ref = doc(partsCol, partId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const d = snap.data() as any;
    // only the same reader can cancel (soft)
    if (d.status === "reading" && d.readerName === readerName) {
      tx.set(ref, {
        status: "available",
        readerName: null,
        updatedAt: serverTimestamp(),
        readAt: null,
      }, { merge: true });
    }
  });
}

export async function markDone(partId: string, readerName: string) {
  const ref = doc(partsCol, partId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const d = snap.data() as any;
    if (d.status === "reading" && d.readerName === readerName) {
      tx.set(ref, {
        status: "done",
        readerName,
        updatedAt: serverTimestamp(),
        readAt: serverTimestamp(),
      }, { merge: true });
    }
  });
}

export async function adminReset(password: string) {
  if (password !== "260126") throw new Error("סיסמה לא נכונה");

  const batch = writeBatch(db);
  for (const p of PARTS) {
    batch.set(doc(partsCol, p.id), {
      status: "available",
      readerName: null,
      updatedAt: serverTimestamp(),
      readAt: null,
    }, { merge: true });
  }
  batch.set(META_DOC, {
    textVersion: TEXT_VERSION,
    partsCount: PARTS.length,
    updatedAt: serverTimestamp(),
    lastResetAt: serverTimestamp(),
  }, { merge: true });

  await batch.commit();
}
