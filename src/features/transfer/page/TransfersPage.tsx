import { useState } from "react";
import { Filter, Plus, X } from "lucide-react";
import { BottomSheet } from "../../../components/BottomSheet";
import { Button } from "../../../components/Button";
import { DatePicker } from "../../../components/DatePicker";
import { Field } from "../../../components/Field";
import { IconDropdown } from "../../../components/IconDropdown";
import { endOfMonthIso, startOfMonthIso } from "../../../utils/date";
import { toAccountOptions, useAccount } from "../../account";
import { useNotifications } from "../../notifications";
import { CreateTransferSheet } from "../components/CreateTransferSheet";
import { EditTransferSheet } from "../components/EditTransferSheet";
import { TransferListItem } from "../components/TransferListItem";
import { TransferListSkeleton } from "../components/TransferListSkeleton";
import { useTransfer } from "../hooks/useTransfer";
import type { ListTransfersOptions, Transfer } from "../types/transfer";

interface Filters {
  accountId: string;
  from: string;
  to: string;
}

function createDefaultFilters(): Filters {
  return {
    accountId: "",
    from: startOfMonthIso(),
    to: endOfMonthIso(),
  };
}

function filtersEqual(a: Filters, b: Filters): boolean {
  return a.accountId === b.accountId && a.from === b.from && a.to === b.to;
}

export function TransfersPage() {
  const [draft, setDraft] = useState<Filters>(createDefaultFilters);
  const [applied, setApplied] = useState<Filters>(createDefaultFilters);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [deletingTransfer, setDeletingTransfer] = useState<Transfer | null>(
    null,
  );

  const notifications = useNotifications();
  const { accounts } = useAccount();

  const options: ListTransfersOptions = {
    ...(applied.accountId ? { accountId: applied.accountId } : {}),
    ...(applied.from ? { from: applied.from } : {}),
    ...(applied.to ? { to: applied.to } : {}),
  };

  const { transfers, isLoading, isError, removeTransfer, isRemoving } =
    useTransfer(options);
  const hasFilters = !filtersEqual(applied, createDefaultFilters());
  const isDirty = !filtersEqual(draft, applied);

  function updateDraft(patch: Partial<Filters>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleApply() {
    setApplied(draft);
  }

  function handleClear() {
    const defaults = createDefaultFilters();
    setDraft(defaults);
    setApplied(defaults);
  }

  async function handleDelete() {
    if (!deletingTransfer) {
      return;
    }

    try {
      await removeTransfer(deletingTransfer.id);
      notifications.success("Transferencia eliminada");
      setDeletingTransfer(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la transferencia.";
      notifications.error("No se pudo eliminar la transferencia", {
        description: message,
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">
            Transferencias
          </h1>
          <p className="text-sm text-muted-foreground">
            Mueve dinero entre tus cuentas.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Nueva transferencia
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Cuenta" htmlFor="filter-transfer-account">
            <IconDropdown
              id="filter-transfer-account"
              value={draft.accountId}
              placeholder="Todas las cuentas"
              options={toAccountOptions(accounts, { includeAll: true })}
              onChange={(accountId) => updateDraft({ accountId })}
            />
          </Field>

          <Field label="Desde" htmlFor="filter-transfer-from">
            <DatePicker
              id="filter-transfer-from"
              value={draft.from}
              max={draft.to || undefined}
              onChange={(from) => updateDraft({ from })}
            />
          </Field>

          <Field label="Hasta" htmlFor="filter-transfer-to">
            <DatePicker
              id="filter-transfer-to"
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
        <TransferListSkeleton />
      ) : isError ? (
        <p className="text-sm text-danger">
          No se pudieron cargar las transferencias.
        </p>
      ) : transfers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {hasFilters
              ? "No hay transferencias con esos filtros."
              : "Aún no tienes transferencias este mes."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {transfers.map((transfer) => (
            <TransferListItem
              key={transfer.id}
              transfer={transfer}
              fromAccount={accounts.find(
                (account) => account.id === transfer.fromAccountId,
              )}
              toAccount={accounts.find(
                (account) => account.id === transfer.toAccountId,
              )}
              onEdit={setEditingTransfer}
              onDelete={setDeletingTransfer}
            />
          ))}
        </ul>
      )}

      <CreateTransferSheet
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
      />

      <EditTransferSheet
        open={editingTransfer !== null}
        transfer={editingTransfer}
        onClose={() => setEditingTransfer(null)}
      />

      <BottomSheet
        open={deletingTransfer !== null}
        onClose={() => setDeletingTransfer(null)}
        title="Eliminar transferencia"
      >
        {deletingTransfer ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              ¿Seguro que quieres eliminar esta transferencia? Se revertirán los
              saldos de ambas cuentas y esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setDeletingTransfer(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isRemoving}
              >
                {isRemoving ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
}
