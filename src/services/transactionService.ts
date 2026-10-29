
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";

import { db } from "../lib/firebase";

import type {
  FinanceTransaction,
  TransactionType,
} from "../types/finance";

export function watchTransactions(
  uid: string,
  onData: (items: FinanceTransaction[]) => void,
  onError: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "users", uid, "transactions"),
    (snapshot) => {
      const items = snapshot.docs.map((item) => ({
        ...item.data(),
        id: item.id,
      })) as FinanceTransaction[];

      onData(
        items.sort((a, b) => b.createdAt - a.createdAt)
      );
    },
    onError
  );
}

export type MovementInput = {
  type: TransactionType;
  amount: number;
  walletId: string;
  destinationWalletId?: string;
  category: string;
  description: string;
};

export async function saveMovement(
  uid: string,
  input: MovementInput
): Promise<void> {
  if (!uid) {
    throw new Error("Debes iniciar sesión.");
  }

  if (
    !["expense", "income", "transfer"].includes(input.type)
  ) {
    throw new Error("Tipo de movimiento inválido.");
  }

  if (
    !Number.isSafeInteger(input.amount) ||
    input.amount <= 0
  ) {
    throw new Error("Ingresa un monto válido.");
  }

  if (!input.walletId) {
    throw new Error("Selecciona una billetera.");
  }

  const transfer = input.type === "transfer";

  if (
    transfer &&
    (!input.destinationWalletId ||
      input.destinationWalletId === input.walletId)
  ) {
    throw new Error(
      "Selecciona otra billetera de destino."
    );
  }

  const originRef = doc(
    db,
    "users",
    uid,
    "wallets",
    input.walletId
  );

  const destinationRef =
    transfer && input.destinationWalletId
      ? doc(
          db,
          "users",
          uid,
          "wallets",
          input.destinationWalletId
        )
      : null;

  const movementRef = doc(
    collection(db, "users", uid, "transactions")
  );

  await runTransaction(db, async (tx) => {
    const originSnapshot = await tx.get(originRef);

    if (!originSnapshot.exists()) {
      throw new Error("La billetera de origen no existe.");
    }

    const originBalance = originSnapshot.data().balance;

    if (
      !Number.isSafeInteger(originBalance) ||
      originBalance < 0
    ) {
      throw new Error("Saldo de origen inválido.");
    }

    let destinationBalance = 0;

    if (destinationRef) {
      const destinationSnapshot =
        await tx.get(destinationRef);

      if (!destinationSnapshot.exists()) {
        throw new Error(
          "La billetera de destino no existe."
        );
      }

      destinationBalance =
        destinationSnapshot.data().balance;

      if (
        !Number.isSafeInteger(destinationBalance) ||
        destinationBalance < 0
      ) {
        throw new Error("Saldo de destino inválido.");
      }
    }

    if (
      input.type !== "income" &&
      originBalance < input.amount
    ) {
      throw new Error(
        "No tienes saldo suficiente."
      );
    }

    const nextOrigin =
      input.type === "income"
        ? originBalance + input.amount
        : originBalance - input.amount;

    if (!Number.isSafeInteger(nextOrigin)) {
      throw new Error("El saldo excede el límite permitido.");
    }

    if (destinationRef) {
      const nextDestination =
        destinationBalance + input.amount;

      if (!Number.isSafeInteger(nextDestination)) {
        throw new Error(
          "El saldo de destino excede el límite permitido."
        );
      }

      tx.update(destinationRef, {
        balance: nextDestination,
        lastMovementId: movementRef.id,
      });
    }

    tx.update(originRef, {
      balance: nextOrigin,
      lastMovementId: movementRef.id,
    });

    tx.set(movementRef, {
      type: input.type,
      amount: input.amount,
      walletId: input.walletId,
      destinationWalletId:
        transfer ? input.destinationWalletId : "",
      category: transfer
        ? "Transferencia"
        : input.category,
      description: input.description.trim(),
      createdAt: Date.now(),
    });
  });
}
