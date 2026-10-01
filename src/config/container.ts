import type { AccountRepository } from "../features/account";
import { createAccountHttpService } from "../features/account/services/account.http.service";
import { createAccountLocalService } from "../features/account/services/account.local.service";
import { env } from "./env";

function createAccountRepository(): AccountRepository {
  switch (env.dataSource) {
    case "local":
      return createAccountLocalService();
    case "server":
      return createAccountHttpService();
  }
}

export const accountRepository = createAccountRepository();
