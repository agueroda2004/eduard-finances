import { AccountListItem, type Account } from "../../account";
import { formatCurrency } from "../../../utils/currency";

interface AccountsSummaryProps {
  accounts: Account[];
}

export function AccountsSummary({ accounts }: AccountsSummaryProps) {
  const total = accounts.reduce(
    (sum, account) => sum + (account.balance ?? 0),
    0,
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-sm font-semibold text-foreground">Cuentas</h2>
        <span className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(total)}
          </span>
        </span>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Aún no tienes cuentas activas.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {accounts.map((account) => (
            <AccountListItem key={account.id} account={account} />
          ))}
        </ul>
      )}
    </section>
  );
}
