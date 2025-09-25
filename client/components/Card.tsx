import { SUBJECT_COLOR_VAR, Subject, WorkType } from "@/constants/subjects";
import { cn } from "@/lib/utils";
import Gallery from "@/components/Gallery";

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
}: {
  item: WorkItem;
  onDelete?: (id: string) => void;
  onToggleComplete?: (id: string, next: boolean) => void;
  completed?: boolean;
  isTeacher?: boolean;
  isStudent?: boolean;
}) {
  const first = item.files?.[0];
  const isPdf = first?.mimeType?.includes("pdf");
  const subjectVar = SUBJECT_COLOR_VAR[item.subject];
  const [open, setOpen] = (useState as any)<boolean>(false);

  return (
    <div className="group rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
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
            <div className="text-xs text-slate-500 tabular-nums whitespace-nowrap flex-shrink-0">{item.date}</div>
          </div>
          {item.description && (
            <p className="mt-1 text-sm text-slate-700 line-clamp-2">{item.description}</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            {item.files?.length ? (
              <div className="flex flex-wrap gap-2">
                {item.files.map((f, idx) => {
                  const pdf = f.mimeType.includes("pdf");
                  return (
                    <a
                      key={idx}
                      href={f.url}
                      download={f.name}
                      target={pdf ? "_blank" : undefined}
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800"
                    >
                      {pdf ? "Open PDF" : "Download"} {item.files!.length > 1 ? idx + 1 : ""}
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
              <button
                onClick={() => onDelete?.(item.id)}
                className={cn(
                  "ml-auto inline-flex items-center px-3 py-1.5 rounded-md border text-sm text-slate-700 hover:bg-slate-50",
                )}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {open && item.files?.length ? (
        <Gallery files={item.files} onClose={() => setOpen(false)} initialIndex={0} />
      ) : null}
    </div>
  );
}
