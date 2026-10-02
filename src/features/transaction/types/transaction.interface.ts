import type {
  CreateTransactionInput,
  ListTransactionsOptions,
  Transaction,
  TransactionId,
  UpdateTransactionInput,
} from "./transaction";

export interface TransactionRepository {
  findAll(
    ownerId: string,
    options?: ListTransactionsOptions,
  ): Promise<Transaction[]>;
  findById(id: TransactionId): Promise<Transaction | null>;
  create(input: CreateTransactionInput): Promise<Transaction>;
  update(
    id: TransactionId,
    input: UpdateTransactionInput,
  ): Promise<Transaction>;
  remove(id: TransactionId): Promise<void>;
}
