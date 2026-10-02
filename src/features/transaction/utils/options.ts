import type { IconDropdownOption } from "../../../components/IconDropdown";
import type { Category } from "../../category";
import { resolveIcon } from "../../account";

export { toAccountOptions } from "../../account";

export function toCategoryOptions(
  categories: Category[],
  { includeAll = false, allLabel = "Todas las categorías" } = {},
): IconDropdownOption[] {
  const options: IconDropdownOption[] = categories.map((category) => ({
    value: category.id,
    label: category.name,
    icon: resolveIcon(category.icon),
    color: category.color,
  }));

  return includeAll ? [{ value: "", label: allLabel }, ...options] : options;
}
