import Layout from "@/components/shared/Layout";
import UploadForm, { UploadPayload } from "@/components/UploadForm";
import { FilterBar, Filters } from "@/components/FilterBar";
import { WorkCard, WorkItem } from "@/components/Card";
import { addItem, listItemsAsync, removeItem, updateItem, addAnnouncement, listAnnouncementsAsync, removeAnnouncement, Announcement, subscribeItems, subscribeAnnouncements } from "@/lib/store";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";
import AnnouncementForm from "@/components/AnnouncementForm";
import { NoticeCard } from "@/components/NoticeCard";

export default function TeacherDashboard() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ type: "All", subject: "All", sort: "Newest" });
  const [uploading, setUploading] = useState(false);
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [posting, setPosting] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [w, n] = await Promise.all([listItemsAsync(), listAnnouncementsAsync()]);
    setItems(w);
    setNotices(n);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const unsubItems = subscribeItems(refresh);
    const unsubAnn = subscribeAnnouncements(refresh);
    return () => { unsubItems && unsubItems(); unsubAnn && unsubAnn(); };
  }, []);

  const handleUpload = async (payload: UploadPayload) => {
    setUploading(true);
    try {
      const { remoteOk, error } = await addItem(payload);
      if (!remoteOk) {
        toast.error("Saved locally; remote sync not configured. Set up Supabase to sync.");
        if (error) console.error(error);
      } else {
        toast.success("Uploaded and synced.");
      }
      await refresh();
    } finally {
      setUploading(false);
    }
  };

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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
            <p className="text-slate-600">Upload and manage homework and classwork. Files save to Supabase public storage.</p>
          </div>
          <button onClick={refresh} className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-slate-50" aria-label="Refresh">Refresh</button>
        </div>

        <UploadForm onSubmit={handleUpload} loading={uploading} />

        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Post Notice</h2>
          </div>
          <AnnouncementForm onSubmit={async (p)=>{ setPosting(true); await addAnnouncement(p); setPosting(false); toast.success("Notice posted"); setNotices(await listAnnouncementsAsync()); }} loading={posting} />
          {notices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notices.map((n)=> (
                <NoticeCard key={n.id} notice={n as any} onDelete={async (id)=>{ await removeAnnouncement(id); setNotices(await listAnnouncementsAsync()); }} />
              ))}
            </div>
          )}
        </div>

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
                <WorkCard item={it} isTeacher onDelete={async (id) => { await removeItem(id); await refresh(); }} onUpdate={async (id, patch)=>{ await updateItem(id, patch); toast.success("Updated"); await refresh(); }} />
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-10">No uploads yet. Use the form above to add work.</div>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 text-center">Created by <span className="text-brand-gradient font-semibold">Vaibhav</span>, Class 8, KV ITBP Second Shift, Dehradun</p>
      </div>
    </Layout>
  );
}
