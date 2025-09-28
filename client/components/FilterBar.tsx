import { SUBJECTS, Subject, WorkType } from "@/constants/subjects";

export interface Filters {
  subject?: Subject | "All";
  type?: WorkType | "All";
  date?: string; // YYYY-MM-DD
  month?: string; // MM
  year?: string; // YYYY
  search?: string;
  sort?: "Newest" | "Oldest";
}

type FieldKey = "subject" | "type" | "date" | "month" | "year" | "search" | "sort";

export function FilterBar({ value, onChange, fields }: { value: Filters; onChange: (f: Filters) => void; fields?: FieldKey[] }) {
  const update = (patch: Partial<Filters>) => onChange({ ...value, ...patch });
  const active: FieldKey[] = fields && fields.length ? fields : ["subject", "type", "date", "month", "year", "search", "sort"];
  const mdCols = active.length >= 7 ? "md:grid-cols-7" : active.length >= 5 ? "md:grid-cols-5" : "md:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${mdCols} gap-3`}>
      {active.includes("subject") && (
        <select
          value={value.subject ?? "All"}
          onChange={(e) => update({ subject: e.target.value as any })}
          className="h-10 rounded-md border px-3 text-sm w-full"
          aria-label="Filter by subject"
        >
          <option value="All">Select Subject</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}
      {active.includes("type") && (
        <select
          value={value.type ?? "All"}
          onChange={(e) => update({ type: e.target.value as any })}
          className="h-10 rounded-md border px-3 text-sm w-full"
          aria-label="Filter by type"
        >
          <option value="All">Select Work Type</option>
          <option>Homework</option>
          <option>Classwork</option>
        </select>
      )}
      {active.includes("date") && (
        <input
          type="date"
          value={value.date ?? ""}
          onChange={(e) => update({ date: e.target.value })}
          className="h-10 rounded-md border px-3 text-sm w-full"
          aria-label="Filter by date"
          placeholder="Choose By Date"
        />
      )}
      {active.includes("month") && (
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
      )}
      {active.includes("year") && (
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
      )}
      {active.includes("search") && (
        <input
          type="search"
          value={value.search ?? ""}
          onChange={(e) => update({ search: e.target.value })}
          className="h-10 rounded-md border px-3 text-sm"
          placeholder="Search..."
          aria-label="Search assignments"
        />
      )}
      {active.includes("sort") && (
        <select
          value={value.sort ?? "Newest"}
          onChange={(e) => update({ sort: e.target.value as any })}
          className="h-10 rounded-md border px-3 text-sm"
          aria-label="Sort order"
        >
          <option>Newest</option>
          <option>Oldest</option>
        </select>
      )}
    </div>
  );
}
