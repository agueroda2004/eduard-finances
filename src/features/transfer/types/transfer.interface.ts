import type {
  CreateTransferInput,
  ListTransfersOptions,
  Transfer,
  TransferId,
  UpdateTransferInput,
} from "./transfer";

export interface TransferRepository {
  findAll(
    ownerId: string,
    options?: ListTransfersOptions,
  ): Promise<Transfer[]>;
  findById(id: TransferId): Promise<Transfer | null>;
  create(input: CreateTransferInput): Promise<Transfer>;
  update(id: TransferId, input: UpdateTransferInput): Promise<Transfer>;
  remove(id: TransferId): Promise<void>;
}
