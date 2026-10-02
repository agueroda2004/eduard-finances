import { useState } from "react";
import { SegmentedControl } from "../../../components/SegmentedControl";
import type { Category } from "../../category";
import {
  TRANSACTION_TYPE_PLURAL_LABELS,
  type TransactionType,
} from "../../transaction";
import type { DashboardSummary } from "../types/dashboard";
import { CategoryBreakdownItem } from "./CategoryBreakdownItem";

interface CategoryBreakdownProps {
  summary: DashboardSummary;
  categories: Category[];
}

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: "expense", label: TRANSACTION_TYPE_PLURAL_LABELS.expense },
  { value: "income", label: TRANSACTION_TYPE_PLURAL_LABELS.income },
];

export function CategoryBreakdown({
  summary,
  categories,
}: CategoryBreakdownProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const breakdown = type === "income" ? summary.income : summary.expense;
  const categoryMap = new Map(
    categories.map((category) => [category.id, category]),
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-foreground">
          Por categoría
        </h2>
        <SegmentedControl
          value={type}
          options={TYPE_OPTIONS}
          onChange={setType}
        />
      </div>

      {breakdown.categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No hay {type === "income" ? "ingresos" : "gastos"} en este período.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {breakdown.categories.map((data) => (
            <CategoryBreakdownItem
              key={data.categoryId}
              data={data}
              total={breakdown.total}
              category={categoryMap.get(data.categoryId)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
