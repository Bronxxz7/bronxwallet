
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Wallet } from "../types/finance";

export function watchWallets(
  uid: string,
  onData: (wallets: Wallet[]) => void,
  onError: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "users", uid, "wallets"),
    (snapshot) => {
      const wallets = snapshot.docs.map((item) => ({
        ...item.data(),
        id: item.id,
      })) as Wallet[];

      onData(wallets.sort(
        (a, b) => a.createdAt - b.createdAt
      ));
    },
    onError
  );
}

export async function createWallet(
  uid: string,
  name: string,
  initialBalance: number
) {
  if (!name.trim() || name.trim().length > 40) {
    throw new Error("Nombre de billetera inválido.");
  }

  if (
    !Number.isSafeInteger(initialBalance) ||
    initialBalance < 0
  ) {
    throw new Error("Saldo inicial inválido.");
  }

  const ref = doc(
    collection(db, "users", uid, "wallets")
  );

  await runTransaction(db, async (transaction) => {
    transaction.set(ref, {
      name: name.trim(),
      initialBalance,
      balance: initialBalance,
      createdAt: Date.now(),
    });
  });
}
