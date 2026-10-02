export interface DateRange {
  from: string;
  to: string;
}

export interface SubcategoryTotal {
  subcategoryId: string | null;
  total: number;
}

export interface CategoryTotal {
  categoryId: string;
  total: number;
  subcategories: SubcategoryTotal[];
}

export interface TypeBreakdown {
  total: number;
  categories: CategoryTotal[];
}

export interface DashboardSummary {
  income: TypeBreakdown;
  expense: TypeBreakdown;
  net: number;
}
