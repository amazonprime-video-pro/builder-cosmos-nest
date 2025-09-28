import Layout from "@/components/shared/Layout";
import { FilterBar, Filters } from "@/components/FilterBar";
import { WorkCard, WorkItem } from "@/components/Card";
import { getCompletedSet, listItemsAsync, setCompleted, listAnnouncementsAsync, Announcement, subscribeItems, subscribeAnnouncements } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { NoticeCard } from "@/components/NoticeCard";

export default function StudentDashboard() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ type: "All", subject: "All", sort: "Newest" });
  const [completed, setCompletedState] = useState<Set<string>>(new Set());
  const [notices, setNotices] = useState<Announcement[]>([]);

  const refresh = async () => {
    setLoading(true);
    const [w, n] = await Promise.all([listItemsAsync(), listAnnouncementsAsync()]);
    setItems(w);
    setNotices(n);
    setLoading(false);
    setCompletedState(getCompletedSet());
  };

  useEffect(() => {
    refresh();
    const unsubItems = subscribeItems(refresh);
    const unsubAnn = subscribeAnnouncements(refresh);
    return () => { unsubItems && unsubItems(); unsubAnn && unsubAnn(); };
  }, []);

  const filtered = useMemo(() => {
    let out = items.filter((it) => {
      if (filters.subject && filters.subject !== "All" && it.subject !== filters.subject) return false;
      if (filters.type && filters.type !== "All" && it.type !== filters.type) return false;
      if (filters.date && it.date !== filters.date) return false;
      if (filters.month && it.date.slice(5, 7) !== filters.month) return false;
      if (filters.year && it.date.slice(0, 4) !== filters.year) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const inFiles = (it.files || []).some((f) => f.name.toLowerCase().includes(q));
        if (!(
          it.subject.toLowerCase().includes(q) ||
          it.type.toLowerCase().includes(q) ||
          (it.description || "").toLowerCase().includes(q) ||
          inFiles
        )) return false;
      }
      return true;
    });
    out.sort((a, b) => (filters.sort === "Oldest" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt));
    return out;
  }, [items, filters]);

  const grouped = useMemo(() => {
    const map = new Map<string, WorkItem[]>();
    for (const it of filtered) {
      const key = it.date.slice(0, 7); // YYYY-MM
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return Array.from(map.entries()).sort((a, b) => (filters.sort === "Oldest" ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0])));
  }, [filtered, filters.sort]);

  const toggleCompleted = (id: string, next: boolean) => {
    setCompleted(id, next);
    setCompletedState(getCompletedSet());
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Student Dashboard</h1>
            <p className="text-slate-600">View daily work and download assignments. Use the checkbox to mark as completed.</p>
          </div>
          <button onClick={refresh} className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-slate-50 pressable" aria-label="Refresh">
            Refresh
          </button>
        </div>

        {notices.length > 0 && (
          <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Notices</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notices.map((n) => (
                <NoticeCard key={n.id} notice={n as any} />
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Assignments</h2>
          </div>
          <div className="bg-slate-50 border rounded-lg p-3 sticky top-20 z-10">
            <div className="text-xs font-semibold text-slate-700 mb-2" aria-hidden>Assignment Filters</div>
            <FilterBar value={filters} onChange={setFilters} fields={["subject","type","date"]} />
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({length:6}).map((_,i)=> (
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
            </div>
          )}

          {!loading && grouped.length === 0 && (
            <div className="text-center text-slate-500 py-10">No assignments found for the selected filters.</div>
          )}

          {!loading && grouped.length > 0 && (
            <Accordion type="multiple" className="w-full">
              {grouped.map(([ym, arr]) => {
                const [y, m] = ym.split("-");
                const date = new Date(Number(y), Number(m)-1, 1);
                const label = date.toLocaleString(undefined, { month: "long", year: "numeric" });
                return (
                  <AccordionItem key={ym} value={ym}>
                    <AccordionTrigger className="text-left">{label}</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {arr.map((it) => (
                          <div key={it.id} className="animate-[fadeIn_.3s_ease-out]">
                            <WorkCard item={it} isStudent completed={completed.has(it.id)} onToggleComplete={toggleCompleted} />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
        <p className="text-xs text-slate-500 text-center">Created by <span className="text-brand-gradient font-semibold">Vaibhav</span>, Class 8, KV ITBP Second Shift, Dehradun</p>
      </div>
    </Layout>
  );
}
