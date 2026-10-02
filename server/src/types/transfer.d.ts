export interface Transfer {
  id: string;
  ownerId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  note: string | null;
  date: string;
}

export interface CreateTransferDTO {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  note?: string | null;
  date: string;
}

export type UpdateTransferDTO = Partial<CreateTransferDTO>;

export interface ListTransfersOptions {
  accountId?: string;
  from?: string;
  to?: string;
}
