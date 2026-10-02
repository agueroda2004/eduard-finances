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

export const accountRepository = createAccountRepository();
export const categoryRepository = createCategoryRepository();
export const subcategoryRepository = createSubcategoryRepository();
