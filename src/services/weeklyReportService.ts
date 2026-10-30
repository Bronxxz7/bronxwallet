
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  limit,
} from "firebase/firestore";

import { db } from "../lib/firebase";

export type SavedWeeklyReport = {
  weekId: string;
  periodStart: number;
  periodEnd: number;
  advice: string;
  generatedAt: number;
  model: string;
};

export function getWeekId(periodStart: number): string {
  const date = new Date(periodStart);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function getSavedWeeklyReport(
  uid: string,
  weekId: string
): Promise<SavedWeeklyReport | null> {
  const ref = doc(
    db,
    "users",
    uid,
    "intelligenceReports",
    weekId
  );

  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return snapshot.data() as SavedWeeklyReport;
}

export async function getWeeklyReportHistory(
  uid: string
): Promise<SavedWeeklyReport[]> {
  const reportsRef = collection(
    db,
    "users",
    uid,
    "intelligenceReports"
  );

  const reportsQuery = query(
    reportsRef,
    orderBy("periodStart", "desc"),
    limit(20)
  );

  const snapshot = await getDocs(reportsQuery);

  return snapshot.docs.map(
    (document) => document.data() as SavedWeeklyReport
  );
}

export async function saveWeeklyReport(
  uid: string,
  report: SavedWeeklyReport
): Promise<void> {
  const ref = doc(
    db,
    "users",
    uid,
    "intelligenceReports",
    report.weekId
  );

  await setDoc(ref, report);
}
