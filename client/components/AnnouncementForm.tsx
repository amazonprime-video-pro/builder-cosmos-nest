import { useState } from "react";
import { cn } from "@/lib/utils";

export type AnnouncementType = "info" | "urgent";

export default function AnnouncementForm({ onSubmit, loading = false }: { onSubmit: (p: { title: string; message: string; type: AnnouncementType; date: string }) => void; loading?: boolean }) {
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info" as AnnouncementType,
    date: new Date().toISOString().slice(0, 10),
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="grid gap-3 bg-white border rounded-xl p-4 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Title</span>
          <input value={form.title} onChange={(e)=>setForm((s)=>({ ...s, title: e.target.value }))} className="h-10 rounded-md border px-3" placeholder="Short title" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Type</span>
          <select value={form.type} onChange={(e)=>setForm((s)=>({ ...s, type: e.target.value as AnnouncementType }))} className="h-10 rounded-md border px-3">
            <option value="info">Info</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Date</span>
          <input type="date" value={form.date} onChange={(e)=>setForm((s)=>({ ...s, date: e.target.value }))} className="h-10 rounded-md border px-3" />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-600">Message</span>
        <textarea value={form.message} onChange={(e)=>setForm((s)=>({ ...s, message: e.target.value }))} rows={3} className="rounded-md border px-3 py-2" placeholder="Details" required />
      </label>
      <div className="flex items-center justify-end">
        <button type="submit" disabled={loading} className="inline-flex items-center rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60">
          {loading ? "Posting..." : "Post Notice"}
        </button>
      </div>
    </form>
  );
}
