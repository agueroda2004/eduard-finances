import { useState } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "../../../components/Button";
import { DatePicker } from "../../../components/DatePicker";
import { Field } from "../../../components/Field";
import { cn } from "../../../utils/cn";
import type { DateRange } from "../types/dashboard";
import {
  currentMonthRange,
  currentYearRange,
  last30DaysRange,
  lastMonthRange,
} from "../utils/range";

interface DateRangeFilterProps {
  applied: DateRange;
  onApply: (range: DateRange) => void;
}

const PRESETS: { label: string; range: () => DateRange }[] = [
  { label: "Este mes", range: currentMonthRange },
  { label: "Mes pasado", range: lastMonthRange },
  { label: "Últimos 30 días", range: last30DaysRange },
  { label: "Este año", range: currentYearRange },
];

export function DateRangeFilter({ applied, onApply }: DateRangeFilterProps) {
  const [draft, setDraft] = useState<DateRange>(applied);
  const isDirty = draft.from !== applied.from || draft.to !== applied.to;

  function matches(range: DateRange): boolean {
    return draft.from === range.from && draft.to === range.to;
  }

  function handleClear() {
    const defaults = currentMonthRange();
    setDraft(defaults);
    onApply(defaults);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const range = preset.range();
          const active = matches(range);
          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={active}
              onClick={() => setDraft(range)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:max-w-md sm:grid-cols-2">
        <Field label="Desde" htmlFor="range-from">
          <DatePicker
            id="range-from"
            value={draft.from}
            max={draft.to || undefined}
            onChange={(from) => setDraft((current) => ({ ...current, from }))}
          />
        </Field>

        <Field label="Hasta" htmlFor="range-to">
          <DatePicker
            id="range-to"
            value={draft.to}
            min={draft.from || undefined}
            onChange={(to) => setDraft((current) => ({ ...current, to }))}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleClear}>
          <RotateCcw className="size-4" />
          Limpiar
        </Button>
        <Button size="sm" onClick={() => onApply(draft)} disabled={!isDirty}>
          <Filter className="size-4" />
          Aplicar
        </Button>
      </div>
    </div>
  );
}
