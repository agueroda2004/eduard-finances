import type { Transaction } from "../../transaction";
import type {
  CategoryTotal,
  DashboardSummary,
  TypeBreakdown,
} from "../types/dashboard";

function buildBreakdown(
  transactions: Transaction[],
  type: Transaction["type"],
): TypeBreakdown {
  const filtered = transactions.filter((transaction) => transaction.type === type);
  const total = filtered.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  const categoryMap = new Map<
    string,
    { total: number; subcategories: Map<string | null, number> }
  >();

  for (const transaction of filtered) {
    const bucket = categoryMap.get(transaction.categoryId) ?? {
      total: 0,
      subcategories: new Map<string | null, number>(),
    };

    bucket.total += transaction.amount;
    bucket.subcategories.set(
      transaction.subcategoryId,
      (bucket.subcategories.get(transaction.subcategoryId) ?? 0) +
        transaction.amount,
    );

    categoryMap.set(transaction.categoryId, bucket);
  }

  const categories: CategoryTotal[] = [...categoryMap.entries()]
    .map(([categoryId, bucket]) => ({
      categoryId,
      total: bucket.total,
      subcategories: [...bucket.subcategories.entries()]
        .map(([subcategoryId, subcategoryTotal]) => ({
          subcategoryId,
          total: subcategoryTotal,
        }))
        .sort((a, b) => b.total - a.total),
    }))
    .sort((a, b) => b.total - a.total);

  return { total, categories };
}

export function aggregateTransactions(
  transactions: Transaction[],
): DashboardSummary {
  const income = buildBreakdown(transactions, "income");
  const expense = buildBreakdown(transactions, "expense");

  return { income, expense, net: income.total - expense.total };
}
