export type TransferId = string;

export interface ListTransfersOptions {
  accountId?: string;
  from?: string;
  to?: string;
}

export interface Transfer {
  id: TransferId;
  ownerId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  note: string | null;
  date: string;
}

export interface CreateTransferInput {
  ownerId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  note?: string | null;
  date: string;
}

export type UpdateTransferInput = Partial<
  Omit<CreateTransferInput, "ownerId">
>;
