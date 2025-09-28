import { AnnouncementType } from "@/components/AnnouncementForm";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export interface Notice {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  date: string;
}

export function NoticeCard({ notice, onDelete }: { notice: Notice; onDelete?: (id: string) => void }) {
  const isUrgent = notice.type === "urgent";
  const preview = notice.message.length > 120 ? notice.message.slice(0, 120) + "…" : notice.message;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className={cn("w-full text-left rounded-xl border bg-white shadow-sm p-4 transition-shadow hover:shadow-md pressable", isUrgent && "ring-1 ring-red-500/30")} aria-label={isUrgent ? "Urgent Notice" : "Notice"}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white", isUrgent ? "bg-red-600" : "bg-slate-900")}>{isUrgent ? "Urgent" : "Info"}</span>
                <div className="text-xs text-slate-600 tabular-nums">{notice.date}</div>
              </div>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 truncate" title={notice.title}>{notice.title}</h3>
              <p className="mt-1 text-sm text-slate-700 line-clamp-2" title={notice.message}>{preview}</p>
            </div>
            {onDelete && (
              <button onClick={(e)=>{ e.stopPropagation(); e.preventDefault(); onDelete(notice.id); }} className="inline-flex items-center px-3 py-1.5 rounded-md border text-sm text-slate-700 hover:bg-slate-50 pressable">Delete</button>
            )}
          </div>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{notice.title}</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="text-xs text-slate-600 mb-2">{notice.date} · {isUrgent ? "Urgent" : "Info"}</div>
            <div className="whitespace-pre-wrap text-slate-800">{notice.message}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end"><AlertDialogAction>Close</AlertDialogAction></div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
