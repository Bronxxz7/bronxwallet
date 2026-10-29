
export type Wallet = {
  id: string;
  name: string;

  // Importes guardados en céntimos.
  // Ejemplo: S/ 25.50 = 2550
  initialBalance: number;
  balance: number;

  // Fecha de creación en milisegundos.
  createdAt: number;
};

export type TransactionType =
  | "expense"
  | "income"
  | "transfer";

export type FinanceTransaction = {
  id: string;
  type: TransactionType;

  // Importe en céntimos.
  amount: number;

  // Billetera de origen para gastos y transferencias.
  // Billetera receptora para ingresos.
  walletId: string;

  // Solo se utiliza en transferencias.
  destinationWalletId?: string;

  category: string;
  description: string;

  // Fecha en milisegundos.
  createdAt: number;
};

export type MovementInput = {
  type: TransactionType;
  amount: number;
  walletId: string;
  destinationWalletId?: string;
  category: string;
  description: string;
};
