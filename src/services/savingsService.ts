
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";

export type SavingsGoal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  createdAt?: unknown;
};

function goalsCollection(uid: string) {
  return collection(db, "users", uid, "savingsGoals");
}

export function watchSavingsGoals(
  uid: string,
  onData: (goals: SavingsGoal[]) => void,
  onError: (error: Error) => void
) {
  return onSnapshot(
    goalsCollection(uid),
    (snapshot) => {
      const goals = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as SavingsGoal[];

      onData(goals);
    },
    onError
  );
}

export async function createSavingsGoal(
  uid: string,
  input: {
    name: string;
    target: number;
  }
): Promise<void> {
  const name = input.name.trim();

  if (!name || name.length > 60) {
    throw new Error("Ingresa un nombre válido.");
  }

  if (
    !Number.isSafeInteger(input.target) ||
    input.target <= 0
  ) {
    throw new Error("Ingresa una meta válida.");
  }

  await addDoc(goalsCollection(uid), {
    name,
    target: input.target,
    saved: 0,
    createdAt: serverTimestamp(),
  });
}

export async function contributeToSavingsGoal(
  uid: string,
  goalId: string,
  amount: number
): Promise<void> {
  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    throw new Error("Ingresa un aporte válido.");
  }

  const goalRef = doc(db, "users", uid, "savingsGoals", goalId);

  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(goalRef);

    if (!snapshot.exists()) {
      throw new Error("La meta ya no existe.");
    }

    const current = snapshot.data().saved;

    if (!Number.isSafeInteger(current) || current < 0) {
      throw new Error("El ahorro registrado es inválido.");
    }

    const next = current + amount;

    if (!Number.isSafeInteger(next)) {
      throw new Error("El monto supera el límite permitido.");
    }

    tx.update(goalRef, { saved: next });
  });
}
