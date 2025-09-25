import { useEffect, useState } from "react";
import type { WorkFile } from "@/components/Card";

export default function Gallery({ files, onClose, initialIndex = 0 }: { files: WorkFile[]; onClose: () => void; initialIndex?: number }) {
  const [index, setIndex] = useState(initialIndex);
  const current = files[index];

  const prev = () => setIndex((i) => (i - 1 + files.length) % files.length);
  const next = () => setIndex((i) => (i + 1) % files.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isImage = current?.mimeType?.startsWith("image/");
  const isPdf = current?.mimeType?.includes("pdf");

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-4xl mx-auto p-4">
        <button onClick={onClose} className="absolute -top-2 right-4 h-10 w-10 rounded-full bg-white/90 hover:bg-white text-slate-900 font-bold">×</button>
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-slate-900 text-white text-sm px-4 py-2 flex items-center justify-between">
            <div className="font-medium">Attachment {index + 1} of {files.length}</div>
            <div className="space-x-2">
              <button onClick={prev} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Prev</button>
              <button onClick={next} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Next</button>
            </div>
          </div>
          <div className="p-4 grid place-items-center min-h-[50vh]">
            {isImage && (
              <img src={current.url} alt={current.name} className="max-h-[70vh] w-auto object-contain rounded-lg" />
            )}
            {isPdf && (
              <a href={current.url} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">Open PDF in new tab</a>
            )}
            {!isImage && !isPdf && (
              <div className="text-slate-600">Unsupported file type</div>
            )}
          </div>
          <div className="px-4 pb-4 text-center text-xs text-slate-600 truncate">{current?.name}</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {files.map((f, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`h-14 w-14 rounded border overflow-hidden ${i === index ? 'ring-2 ring-slate-900' : ''}`}>
              {f.mimeType.startsWith('image/') ? (
                <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-[10px] text-slate-600">PDF</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
