import type { AccountRepository } from "../features/account";
import { createAccountHttpService } from "../features/account/services/account.http.service";
import { createAccountLocalService } from "../features/account/services/account.local.service";
import type {
  CategoryRepository,
  SubcategoryRepository,
} from "../features/category";
import {
  createCategoryHttpService,
  createSubcategoryHttpService,
} from "../features/category/services/category.http.service";
import {
  createCategoryLocalService,
  createSubcategoryLocalService,
} from "../features/category/services/category.local.service";
import type { TransactionRepository } from "../features/transaction";
import { createTransactionHttpService } from "../features/transaction/services/transaction.http.service";
import { createTransactionLocalService } from "../features/transaction/services/transaction.local.service";
import type { TransferRepository } from "../features/transfer";
import { createTransferHttpService } from "../features/transfer/services/transfer.http.service";
import { createTransferLocalService } from "../features/transfer/services/transfer.local.service";
import { env } from "./env";

function createAccountRepository(): AccountRepository {
  switch (env.dataSource) {
    case "local":
      return createAccountLocalService();
    case "server":
      return createAccountHttpService();
  }
}

function createCategoryRepository(): CategoryRepository {
  switch (env.dataSource) {
    case "local":
      return createCategoryLocalService();
    case "server":
      return createCategoryHttpService();
  }
}

function createSubcategoryRepository(): SubcategoryRepository {
  switch (env.dataSource) {
    case "local":
      return createSubcategoryLocalService();
    case "server":
      return createSubcategoryHttpService();
  }
}

function createTransactionRepository(): TransactionRepository {
  switch (env.dataSource) {
    case "local":
      return createTransactionLocalService();
    case "server":
      return createTransactionHttpService();
  }
}

function createTransferRepository(): TransferRepository {
  switch (env.dataSource) {
    case "local":
      return createTransferLocalService();
    case "server":
      return createTransferHttpService();
  }
}

export const accountRepository = createAccountRepository();
export const categoryRepository = createCategoryRepository();
export const subcategoryRepository = createSubcategoryRepository();
export const transactionRepository = createTransactionRepository();
export const transferRepository = createTransferRepository();
