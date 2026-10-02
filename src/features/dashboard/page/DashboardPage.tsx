import { useState } from "react";
import { AccountsSummary } from "../components/AccountsSummary";
import { CategoryBreakdown } from "../components/CategoryBreakdown";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { PeriodSummary } from "../components/PeriodSummary";
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import type { DateRange } from "../types/dashboard";
import { currentMonthRange } from "../utils/range";

export function DashboardPage() {
  const [range, setRange] = useState<DateRange>(currentMonthRange);
  const { accounts, categories, summary, isLoading, isError } =
    useDashboardSummary(range);
  const activeAccounts = accounts.filter((account) => account.active);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">Inicio</h1>
        <p className="text-sm text-muted-foreground">
          Resumen de tus finanzas.
        </p>
      </div>

      <DateRangeFilter applied={range} onApply={setRange} />

      {isError ? (
        <p className="text-sm text-danger">No se pudo cargar el resumen.</p>
      ) : isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <PeriodSummary
            income={summary.income.total}
            expense={summary.expense.total}
            net={summary.net}
          />
          <AccountsSummary accounts={activeAccounts} />
          <CategoryBreakdown summary={summary} categories={categories} />
        </>
      )}
    </div>
  );
}
