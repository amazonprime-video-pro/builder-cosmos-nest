import { AnnouncementType } from "@/components/AnnouncementForm";
import { cn } from "@/lib/utils";

export interface Notice {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  date: string;
}

export function NoticeCard({ notice, onDelete }: { notice: Notice; onDelete?: (id: string) => void }) {
  const isUrgent = notice.type === "urgent";
  return (
    <div className={cn("rounded-xl border bg-white shadow-sm p-4 transition-shadow hover:shadow-md", isUrgent && "ring-1 ring-red-500/30")}
      role="region" aria-label={isUrgent ? "Urgent Notice" : "Notice"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white", isUrgent ? "bg-red-600" : "bg-slate-900")}>{isUrgent ? "Urgent" : "Info"}</span>
            <div className="text-xs text-slate-600 tabular-nums">{notice.date}</div>
          </div>
          <h3 className="mt-1 text-sm font-semibold text-slate-900 truncate">{notice.title}</h3>
          <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{notice.message}</p>
        </div>
        {onDelete && (
          <button onClick={()=>onDelete(notice.id)} className="inline-flex items-center px-3 py-1.5 rounded-md border text-sm text-slate-700 hover:bg-slate-50">Delete</button>
        )}
      </div>
    </div>
  );
}
