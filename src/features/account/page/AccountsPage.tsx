import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/Button";
import { AccountListItem } from "../components/AccountListItem";
import { AccountListSkeleton } from "../components/AccountListSkeleton";
import { CreateAccountSheet } from "../components/CreateAccountSheet";
import { EditAccountSheet } from "../components/EditAccountSheet";
import { useAccount } from "../hooks/useAccount";
import type { Account } from "../types/account";

export function AccountsPage() {
  const { accounts, isLoading, isError } = useAccount();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">Cuentas</h1>
          <p className="text-sm text-muted-foreground">Administra tus cuentas.</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Nueva cuenta
        </Button>
      </div>

      {isLoading ? (
        <AccountListSkeleton />
      ) : isError ? (
        <p className="text-sm text-danger">No se pudieron cargar las cuentas.</p>
      ) : accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Aún no tienes cuentas.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {accounts.map((account) => (
            <AccountListItem
              key={account.id}
              account={account}
              onEdit={setEditingAccount}
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
    </div>
  );
}
