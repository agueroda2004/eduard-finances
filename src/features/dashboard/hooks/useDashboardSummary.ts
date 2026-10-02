import { useMemo } from "react";
import { useAccount } from "../../account";
import { useCategory } from "../../category";
import { useTransaction } from "../../transaction";
import type { DateRange } from "../types/dashboard";
import { aggregateTransactions } from "../utils/aggregate";

export function useDashboardSummary(range: DateRange) {
  const { accounts, isLoading: isAccountsLoading } = useAccount({
    includeInactive: true,
  });
  const { categories, isLoading: isCategoriesLoading } = useCategory({
    includeInactive: true,
  });
  const {
    transactions,
    isLoading: isTransactionsLoading,
    isError,
  } = useTransaction({ from: range.from, to: range.to });

  const summary = useMemo(
    () => aggregateTransactions(transactions),
    [transactions],
  );

  return {
    accounts,
    categories,
    summary,
    isLoading:
      isAccountsLoading || isCategoriesLoading || isTransactionsLoading,
    isError,
  };
}
