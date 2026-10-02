import { Skeleton } from "../../../components/Skeleton";

export function CategoryListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
        >
          <Skeleton className="size-10 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="size-9 rounded-lg" />
        </li>
      ))}
    </ul>
  );
}
