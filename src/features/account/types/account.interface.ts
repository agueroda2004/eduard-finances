import type {
  Account,
  AccountId,
  CreateAccountInput,
  UpdateAccountInput,
} from "./account";

export interface AccountRepository {
  findAll(ownerId: string): Promise<Account[]>;
  findById(id: AccountId): Promise<Account | null>;
  create(input: CreateAccountInput): Promise<Account>;
  update(id: AccountId, input: UpdateAccountInput): Promise<Account>;
  remove(id: AccountId): Promise<void>;
}
