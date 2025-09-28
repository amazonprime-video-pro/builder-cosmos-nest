import { SUBJECT_COLOR_VAR, Subject, WorkType } from "@/constants/subjects";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Gallery from "@/components/Gallery";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export interface WorkFile {
  name: string;
  url: string; // data URL or remote URL
  mimeType: string;
}

export interface WorkItem {
  id: string;
  subject: Subject;
  type: WorkType;
  date: string; // YYYY-MM-DD
  description?: string;
  files?: WorkFile[];
  createdAt: number;
}

export function WorkCard({
  item,
  onDelete,
  onToggleComplete,
  completed,
  isTeacher,
  isStudent,
  onUpdate,
}: {
  item: WorkItem;
  onDelete?: (id: string) => void;
  onToggleComplete?: (id: string, next: boolean) => void;
  completed?: boolean;
  isTeacher?: boolean;
  isStudent?: boolean;
  onUpdate?: (id: string, patch: Partial<Omit<WorkItem, "id" | "createdAt">>) => void;
}) {
  const files = item.files ?? ((item as any).file ? [((item as any).file as any)] : []);
  const first = files[0];
  const isPdf = first?.mimeType?.includes("pdf");
  const subjectVar = SUBJECT_COLOR_VAR[item.subject];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({ subject: item.subject, type: item.type, date: item.date, description: item.description || "" });

  return (
    <div className="group rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden motion-safe:transform motion-safe:hover:-translate-y-0.5">
      <div
        className="h-1 w-full"
        style={{ backgroundColor: `hsl(${subjectVar})` }}
      />
      <div className="p-4 flex gap-4">
        <button onClick={() => item.files?.length && setOpen(true)} className="h-16 w-16 flex-shrink-0 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center focus:outline-none">
          {first?.url ? (
            isPdf ? (
              <div className="text-red-600 text-xs font-semibold">PDF</div>
            ) : (
              <img src={first.url} alt={first.name} className="h-full w-full object-cover" />
            )
          ) : (
            <div className="text-slate-400 text-xs">No File</div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          {!editing ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white"
                    style={{ backgroundColor: `hsl(${subjectVar})` }}
                  >
                    {item.subject}
                  </span>
                  <span className="text-xs text-slate-500">{item.type}</span>
                </div>
                <div className="text-xs text-slate-600 tabular-nums whitespace-nowrap flex-shrink-0">{item.date}</div>
              </div>
              {item.description && (
                <p className="mt-1 text-sm text-slate-700 line-clamp-2">{item.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {files.length ? (
                  <div className="flex flex-wrap gap-2">
                    {files.map((f, idx) => {
                      const pdf = f.mimeType.includes("pdf");
                      return (
                        <a
                          key={idx}
                          href={f.url}
                          download={f.name}
                          target={pdf ? "_blank" : undefined}
                          rel="noreferrer"
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800 transition-all shadow-sm hover:shadow pressable"
                        >
                          {pdf ? "Open PDF" : "Download"} {files.length > 1 ? idx + 1 : ""}
                        </a>
                      );
                    })}
                  </div>
                ) : null}
                {isStudent && (
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!completed}
                      onChange={(e) => onToggleComplete?.(item.id, e.target.checked)}
                    />
                    Mark Completed
                  </label>
                )}
                {isTeacher && (
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md border text-sm text-slate-700 hover:bg-slate-50 transition-colors pressable"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete?.(item.id)}
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-md border text-sm text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); onUpdate?.(item.id, { subject: edit.subject, type: edit.type, date: edit.date, description: edit.description }); setEditing(false); }}
              className="space-y-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select value={edit.subject} onChange={(e)=>setEdit((s)=>({ ...s, subject: e.target.value as any }))} className="h-9 rounded-md border px-2 text-sm">
                  {Object.keys(SUBJECT_COLOR_VAR).map((s)=> (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select value={edit.type} onChange={(e)=>setEdit((s)=>({ ...s, type: e.target.value as any }))} className="h-9 rounded-md border px-2 text-sm">
                  <option>Homework</option>
                  <option>Classwork</option>
                </select>
                <input type="date" value={edit.date} onChange={(e)=>setEdit((s)=>({ ...s, date: e.target.value }))} className="h-9 rounded-md border px-2 text-sm" />
                <div />
              </div>
              <textarea value={edit.description} onChange={(e)=>setEdit((s)=>({ ...s, description: e.target.value }))} rows={2} className="w-full rounded-md border px-2 py-1 text-sm" placeholder="Description" />
              <div className="flex items-center gap-2 justify-end">
                <button type="button" onClick={()=>{ setEditing(false); setEdit({ subject: item.subject, type: item.type, date: item.date, description: item.description || "" }); }} className="inline-flex items-center px-3 py-1.5 rounded-md border text-sm hover:bg-slate-50 pressable">Cancel</button>
                <button type="submit" className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800 pressable">Save</button>
              </div>
            </form>
          )}
        </div>
      </div>
      {open && files.length ? (
        <Gallery files={files as any} onClose={() => setOpen(false)} initialIndex={0} />
      ) : null}
    </div>
  );
}
