import { Wallet, type LucideIcon } from "lucide-react";
import type { IconDropdownOption } from "../../../components/IconDropdown";
import {
  ACCOUNT_ICONS,
  type AccountIcon,
} from "../../../constants/icon.constant";
import type { Account } from "../types/account";

export function resolveIcon(name: string): LucideIcon {
  return ACCOUNT_ICONS[name as AccountIcon] ?? Wallet;
}

export function toAccountOptions(
  accounts: Account[],
  { includeAll = false, allLabel = "Todas las cuentas" } = {},
): IconDropdownOption[] {
  const options: IconDropdownOption[] = accounts.map((account) => ({
    value: account.id,
    label: account.name,
    icon: resolveIcon(account.icon),
    color: account.color,
  }));

  return includeAll ? [{ value: "", label: allLabel }, ...options] : options;
}
