import Layout from "@/components/shared/Layout";
import UploadForm, { UploadPayload } from "@/components/UploadForm";
import { FilterBar, Filters } from "@/components/FilterBar";
import { WorkCard, WorkItem } from "@/components/Card";
import { addItem, listItems, removeItem } from "@/lib/store";
import { useEffect, useMemo, useState } from "react";

export default function TeacherDashboard() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [filters, setFilters] = useState<Filters>({ type: "All", subject: "All" });

  useEffect(() => {
    setItems(listItems());
  }, []);

  const handleUpload = async (payload: UploadPayload) => {
    await addItem(payload);
    setItems(listItems());
  };

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (filters.subject && filters.subject !== "All" && it.subject !== filters.subject) return false;
      if (filters.type && filters.type !== "All" && it.type !== filters.type) return false;
      if (filters.date && it.date !== filters.date) return false;
      if (filters.month && it.date.slice(5, 7) !== filters.month) return false;
      if (filters.year && it.date.slice(0, 4) !== filters.year) return false;
      return true;
    });
  }, [items, filters]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
          <p className="text-slate-600">Upload and manage homework and classwork. Changes are instant.</p>
        </div>
        <UploadForm onSubmit={handleUpload} />
        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Uploaded Work</h2>
          </div>
          <FilterBar value={filters} onChange={setFilters} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((it) => (
              <WorkCard key={it.id} item={it} isTeacher onDelete={(id) => { removeItem(id); setItems(listItems()); }} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-10">No uploads yet. Use the form above to add work.</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
