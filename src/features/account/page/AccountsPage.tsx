import { useState } from "react";
import { Eye, EyeOff, Plus } from "lucide-react";
import { Button } from "../../../components/Button";
import { ConfirmSheet } from "../../../components/ConfirmSheet";
import { useNotifications } from "../../notifications";
import { AccountListItem } from "../components/AccountListItem";
import { AccountListSkeleton } from "../components/AccountListSkeleton";
import { CreateAccountSheet } from "../components/CreateAccountSheet";
import { EditAccountSheet } from "../components/EditAccountSheet";
import { useAccount } from "../hooks/useAccount";
import type { Account } from "../types/account";

export function AccountsPage() {
  const [showInactive, setShowInactive] = useState(false);
  const {
    accounts,
    isLoading,
    isError,
    removeAccount,
    isRemoving,
  } = useAccount({
    includeInactive: showInactive,
  });
  const notifications = useNotifications();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);

  async function handleDelete() {
    if (!deletingAccount) {
      return;
    }

    try {
      await removeAccount(deletingAccount.id);
      notifications.success("Cuenta eliminada");
      setDeletingAccount(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la cuenta.";
      notifications.error("No se pudo eliminar la cuenta", {
        description: message,
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">Cuentas</h1>
          <p className="text-sm text-muted-foreground">Administra tus cuentas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-pressed={showInactive}
            onClick={() => setShowInactive((current) => !current)}
          >
            {showInactive ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
            {showInactive ? "Ocultar inactivas" : "Ver inactivas"}
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Nueva cuenta
          </Button>
        </div>
      </div>

      {isLoading ? (
        <AccountListSkeleton />
      ) : isError ? (
        <p className="text-sm text-danger">No se pudieron cargar las cuentas.</p>
      ) : accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {showInactive
              ? "Aún no tienes cuentas."
              : "Aún no tienes cuentas activas."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {accounts.map((account) => (
            <AccountListItem
              key={account.id}
              account={account}
              onEdit={setEditingAccount}
              onDelete={setDeletingAccount}
            />
          ))}
        </ul>
      )}

      <CreateAccountSheet
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
      />

      <EditAccountSheet
        open={editingAccount !== null}
        account={editingAccount}
        onClose={() => setEditingAccount(null)}
      />

      <ConfirmSheet
        open={deletingAccount !== null}
        onClose={() => setDeletingAccount(null)}
        onConfirm={handleDelete}
        title="Eliminar cuenta"
        description="¿Seguro que quieres eliminar esta cuenta? Solo es posible si no tiene transacciones ni transferencias asociadas. Esta acción no se puede deshacer."
        isLoading={isRemoving}
      />
    </div>
  );
}
