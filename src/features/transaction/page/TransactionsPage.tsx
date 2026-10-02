import { useState } from "react";
import { Filter, Plus, X } from "lucide-react";
import { useSearchParams } from "react-router";
import { Button } from "../../../components/Button";
import { ConfirmSheet } from "../../../components/ConfirmSheet";
import { DatePicker } from "../../../components/DatePicker";
import { Dropdown } from "../../../components/Dropdown";
import { Field } from "../../../components/Field";
import { IconDropdown } from "../../../components/IconDropdown";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { endOfMonthIso, startOfMonthIso } from "../../../utils/date";
import { useAccount } from "../../account";
import { useCategory, useSubcategory } from "../../category";
import { useNotifications } from "../../notifications";
import { CreateTransactionSheet } from "../components/CreateTransactionSheet";
import { EditTransactionSheet } from "../components/EditTransactionSheet";
import { TransactionListItem } from "../components/TransactionListItem";
import { TransactionListSkeleton } from "../components/TransactionListSkeleton";
import { useTransaction } from "../hooks/useTransaction";
import type { ListTransactionsOptions, Transaction } from "../types/transaction";
import {
  TRANSACTION_TYPE_PLURAL_LABELS,
  type TransactionType,
} from "../types/transaction.constants";
import { toAccountOptions, toCategoryOptions } from "../utils/options";

type TypeFilter = "all" | TransactionType;

interface Filters {
  type: TypeFilter;
  accountId: string;
  categoryId: string;
  subcategoryId: string;
  from: string;
  to: string;
}

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "income", label: TRANSACTION_TYPE_PLURAL_LABELS.income },
  { value: "expense", label: TRANSACTION_TYPE_PLURAL_LABELS.expense },
];

function createDefaultFilters(): Filters {
  return {
    type: "all",
    accountId: "",
    categoryId: "",
    subcategoryId: "",
    from: startOfMonthIso(),
    to: endOfMonthIso(),
  };
}

function filtersEqual(a: Filters, b: Filters): boolean {
  return (
    a.type === b.type &&
    a.accountId === b.accountId &&
    a.categoryId === b.categoryId &&
    a.subcategoryId === b.subcategoryId &&
    a.from === b.from &&
    a.to === b.to
  );
}

export function TransactionsPage() {
  const [draft, setDraft] = useState<Filters>(createDefaultFilters);
  const [applied, setApplied] = useState<Filters>(createDefaultFilters);
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreateOpen = searchParams.get("new") !== null;
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const notifications = useNotifications();
  const { accounts } = useAccount();
  const { categories } = useCategory();
  const { subcategories } = useSubcategory(draft.categoryId);

  const visibleCategories = categories.filter(
    (category) => draft.type === "all" || category.type === draft.type,
  );

  const options: ListTransactionsOptions = {
    ...(applied.type !== "all" ? { type: applied.type } : {}),
    ...(applied.accountId ? { accountId: applied.accountId } : {}),
    ...(applied.categoryId ? { categoryId: applied.categoryId } : {}),
    ...(applied.subcategoryId
      ? { subcategoryId: applied.subcategoryId }
      : {}),
    ...(applied.from ? { from: applied.from } : {}),
    ...(applied.to ? { to: applied.to } : {}),
  };

  const { transactions, isLoading, isError, removeTransaction, isRemoving } =
    useTransaction(options);
  const hasFilters = !filtersEqual(applied, createDefaultFilters());
  const isDirty = !filtersEqual(draft, applied);

  function updateDraft(patch: Partial<Filters>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleTypeChange(type: TypeFilter) {
    updateDraft({ type, categoryId: "", subcategoryId: "" });
  }

  function handleCategoryChange(categoryId: string) {
    updateDraft({ categoryId, subcategoryId: "" });
  }

  function handleApply() {
    setApplied(draft);
  }

  function openCreate() {
    const next = new URLSearchParams(searchParams);
    next.set("new", "1");
    setSearchParams(next);
  }

  function closeCreate() {
    const next = new URLSearchParams(searchParams);
    next.delete("new");
    setSearchParams(next, { replace: true });
  }

  function handleClear() {
    const defaults = createDefaultFilters();
    setDraft(defaults);
    setApplied(defaults);
  }

  async function handleDelete() {
    if (!deletingTransaction) {
      return;
    }

    try {
      await removeTransaction(deletingTransaction.id);
      notifications.success("Transacción eliminada");
      setDeletingTransaction(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la transacción.";
      notifications.error("No se pudo eliminar la transacción", {
        description: message,
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">
            Transacciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra tus movimientos.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          Nueva transacción
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
        <SegmentedControl
          value={draft.type}
          options={TYPE_TABS}
          onChange={handleTypeChange}
          className="w-full sm:w-auto"
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Cuenta" htmlFor="filter-account">
            <IconDropdown
              id="filter-account"
              value={draft.accountId}
              placeholder="Todas las cuentas"
              options={toAccountOptions(accounts, { includeAll: true })}
              onChange={(accountId) => updateDraft({ accountId })}
            />
          </Field>

          <Field label="Categoría" htmlFor="filter-category">
            <IconDropdown
              id="filter-category"
              value={draft.categoryId}
              placeholder="Todas las categorías"
              options={toCategoryOptions(visibleCategories, {
                includeAll: true,
              })}
              onChange={handleCategoryChange}
            />
          </Field>

          <Field label="Subcategoría" htmlFor="filter-subcategory">
            <Dropdown
              id="filter-subcategory"
              value={draft.subcategoryId}
              disabled={!draft.categoryId}
              placeholder="Todas las subcategorías"
              options={[
                { value: "", label: "Todas las subcategorías" },
                ...subcategories.map((subcategory) => ({
                  value: subcategory.id,
                  label: subcategory.name,
                })),
              ]}
              onChange={(subcategoryId) => updateDraft({ subcategoryId })}
            />
          </Field>

          <Field label="Desde" htmlFor="filter-from">
            <DatePicker
              id="filter-from"
              value={draft.from}
              max={draft.to || undefined}
              onChange={(from) => updateDraft({ from })}
            />
          </Field>

          <Field label="Hasta" htmlFor="filter-to">
            <DatePicker
              id="filter-to"
              value={draft.to}
              min={draft.from || undefined}
              onChange={(to) => updateDraft({ to })}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleClear}>
            <X className="size-4" />
            Limpiar filtros
          </Button>
          <Button size="sm" onClick={handleApply} disabled={!isDirty}>
            <Filter className="size-4" />
            Aplicar filtros
          </Button>
        </div>
      </div>

      {isLoading ? (
        <TransactionListSkeleton />
      ) : isError ? (
        <p className="text-sm text-danger">
          No se pudieron cargar las transacciones.
        </p>
      ) : transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {hasFilters
              ? "No hay transacciones con esos filtros."
              : "Aún no tienes transacciones este mes."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {transactions.map((transaction) => (
            <TransactionListItem
              key={transaction.id}
              transaction={transaction}
              account={accounts.find(
                (account) => account.id === transaction.accountId,
              )}
              category={categories.find(
                (category) => category.id === transaction.categoryId,
              )}
              onEdit={setEditingTransaction}
              onDelete={setDeletingTransaction}
            />
          ))}
        </ul>
      )}

      <CreateTransactionSheet open={isCreateOpen} onClose={closeCreate} />

      <EditTransactionSheet
        open={editingTransaction !== null}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />

      <ConfirmSheet
        open={deletingTransaction !== null}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDelete}
        title="Eliminar transacción"
        description="¿Seguro que quieres eliminar esta transacción? Se ajustará el saldo de la cuenta y esta acción no se puede deshacer."
        isLoading={isRemoving}
      />
    </div>
  );
}
