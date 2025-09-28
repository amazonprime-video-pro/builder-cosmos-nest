import { SUBJECTS, Subject, WorkType } from "@/constants/subjects";
import { cn } from "@/lib/utils";

export interface Filters {
  subject?: Subject | "All";
  type?: WorkType | "All";
  date?: string; // YYYY-MM-DD
  month?: string; // MM
  year?: string; // YYYY
  search?: string;
  sort?: "Newest" | "Oldest";
}

export function FilterBar({ value, onChange }: { value: Filters; onChange: (f: Filters) => void }) {
  const update = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
      <select
        value={value.subject ?? "All"}
        onChange={(e) => update({ subject: e.target.value as any })}
        className="h-10 rounded-md border px-3 text-sm"
        aria-label="Filter by subject"
      >
        <option>All</option>
        {SUBJECTS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={value.type ?? "All"}
        onChange={(e) => update({ type: e.target.value as any })}
        className="h-10 rounded-md border px-3 text-sm"
        aria-label="Filter by type"
      >
        <option>All</option>
        <option>Homework</option>
        <option>Classwork</option>
      </select>
      <input
        type="date"
        value={value.date ?? ""}
        onChange={(e) => update({ date: e.target.value })}
        className="h-10 rounded-md border px-3 text-sm"
        aria-label="Filter by date"
      />
      <select
        value={value.month ?? ""}
        onChange={(e) => update({ month: e.target.value })}
        className="h-10 rounded-md border px-3 text-sm"
        aria-label="Filter by month"
      >
        <option value="">Month</option>
        {[...Array(12)].map((_, i) => {
          const val = String(i + 1).padStart(2, "0");
          return (
            <option key={val} value={val}>
              {val}
            </option>
          );
        })}
      </select>
      <select
        value={value.year ?? ""}
        onChange={(e) => update({ year: e.target.value })}
        className="h-10 rounded-md border px-3 text-sm"
        aria-label="Filter by year"
      >
        <option value="">Year</option>
        {Array.from({ length: 6 }, (_, k) => new Date().getFullYear() - k).map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
      <input
        type="search"
        value={value.search ?? ""}
        onChange={(e) => update({ search: e.target.value })}
        className="h-10 rounded-md border px-3 text-sm"
        placeholder="Search..."
        aria-label="Search assignments"
      />
      <select
        value={value.sort ?? "Newest"}
        onChange={(e) => update({ sort: e.target.value as any })}
        className="h-10 rounded-md border px-3 text-sm"
        aria-label="Sort order"
      >
        <option>Newest</option>
        <option>Oldest</option>
      </select>
    </div>
  );
}
