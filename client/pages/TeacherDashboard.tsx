import Layout from "@/components/shared/Layout";
import UploadForm, { UploadPayload } from "@/components/UploadForm";
import { FilterBar, Filters } from "@/components/FilterBar";
import { WorkCard, WorkItem } from "@/components/Card";
import { addItem, listItems, listItemsAsync, removeItem, subscribeItems } from "@/lib/store";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";

export default function TeacherDashboard() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ type: "All", subject: "All" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    listItemsAsync().then((d)=>{setItems(d); setLoading(false);});
    const unsub = subscribeItems(() => listItemsAsync().then((d)=>{setItems(d);}));
    return unsub;
  }, []);

  const handleUpload = async (payload: UploadPayload) => {
    setUploading(true);
    try {
      const { remoteOk, error } = await addItem(payload);
      if (!remoteOk) {
        toast.error("Saved locally; remote sync not configured. Run Supabase setup.");
        if (error) console.error(error);
      } else {
        toast.success("Uploaded and synced.");
      }
      setItems(await listItemsAsync());
    } finally {
      setUploading(false);
    }
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
        <UploadForm onSubmit={handleUpload} loading={uploading} />
        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Uploaded Work</h2>
          </div>
          <div className="bg-slate-50 border rounded-lg p-3 sticky top-20 z-10"><FilterBar value={filters} onChange={setFilters} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && Array.from({length:6}).map((_,i)=> (
              <div key={i} className="rounded-xl border bg-white p-4 space-y-3">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </div>
            ))}
            {!loading && filtered.map((it) => (
              <div key={it.id} className="animate-[fadeIn_.3s_ease-out]">
                <WorkCard item={it} isTeacher onDelete={async (id) => { await removeItem(id); setItems(await listItemsAsync()); }} />
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-10">No uploads yet. Use the form above to add work.</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
