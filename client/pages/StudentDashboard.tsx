import Layout from "@/components/shared/Layout";
import { FilterBar, Filters } from "@/components/FilterBar";
import { WorkCard, WorkItem } from "@/components/Card";
import { getCompletedSet, listItems, listItemsAsync, setCompleted, subscribeItems } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";

export default function StudentDashboard() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ type: "All", subject: "All", date: new Date().toISOString().slice(0,10) });
  const [completed, setCompletedState] = useState<Set<string>>(new Set());

  useEffect(() => {
    let liveUnsub: (() => void) | undefined;
    listItemsAsync().then((d)=>{setItems(d); setLoading(false);});
    setCompletedState(getCompletedSet());
    liveUnsub = subscribeItems(() => listItemsAsync().then((d)=>{setItems(d);}));
    const id = setInterval(() => { listItemsAsync().then(setItems); }, 5000);
    const onVis = () => { if (document.visibilityState === 'visible') listItemsAsync().then(setItems); };
    document.addEventListener('visibilitychange', onVis);
    return () => { liveUnsub && liveUnsub(); clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, []);

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

  const toggleCompleted = (id: string, next: boolean) => {
    setCompleted(id, next);
    setCompletedState(getCompletedSet());
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Student Dashboard</h1>
          <p className="text-slate-600">View daily work and download assignments. Use the checkbox to mark as completed.</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Assignments</h2>
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
                <WorkCard item={it} isStudent completed={completed.has(it.id)} onToggleComplete={toggleCompleted} />
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-10">No assignments found for the selected filters.</div>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 text-center">Created by Vaibhav, Class 8, KV ITBP Second Shift, Dehradun</p>
      </div>
    </Layout>
  );
}
