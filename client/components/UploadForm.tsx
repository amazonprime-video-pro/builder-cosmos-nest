import { useState } from "react";
import { SUBJECTS, Subject, WorkType } from "@/constants/subjects";
import { cn } from "@/lib/utils";

export interface UploadPayload {
  subject: Subject;
  type: WorkType;
  date: string; // YYYY-MM-DD
  description?: string;
  files?: File[];
}

export default function UploadForm({ onSubmit }: { onSubmit: (p: UploadPayload) => void }) {
  const [form, setForm] = useState<UploadPayload>({
    subject: "Math",
    type: "Homework",
    date: new Date().toISOString().slice(0, 10),
    description: "",
    files: [],
  });

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => /(image\/(jpg|jpeg|png)|application\/pdf)/i.test(f.type));
    if (valid.length !== files.length) {
      alert("Only JPG, JPEG, PNG, or PDF allowed");
    }
    setForm((s) => ({ ...s, files: valid }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="grid gap-3 bg-white border rounded-xl p-4 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Subject</span>
          <select
            value={form.subject}
            onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value as Subject }))}
            className="h-10 rounded-md border px-3"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Type</span>
          <select
            value={form.type}
            onChange={(e) => setForm((s) => ({ ...s, type: e.target.value as WorkType }))}
            className="h-10 rounded-md border px-3"
          >
            <option>Homework</option>
            <option>Classwork</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
            className="h-10 rounded-md border px-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Files</span>
          <input
            multiple
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/*,application/pdf"
            onChange={handleFiles}
            className="h-10 rounded-md border px-3 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-900 file:text-white"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-600">Description</span>
        <textarea
          value={form.description}
          onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          rows={3}
          className="rounded-md border px-3 py-2"
          placeholder="Optional instructions or notes"
        />
      </label>
      <div className="flex items-center justify-end">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
        >
          Upload
        </button>
      </div>
    </form>
  );
}
