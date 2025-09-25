import { Subject, WorkType } from "@/constants/subjects";
import type { WorkItem, WorkFile } from "@/components/Card";

const KEY = "kv8-work-items";
const COMPLETED_KEY = "kv8-completed-ids";

function migrate(items: any[]): WorkItem[] {
  return items.map((x) => {
    // migrate legacy single-file items to files[]
    if (!x.files && x.file) {
      x.files = [x.file];
      delete x.file;
    }
    return x;
  });
}

function load(): WorkItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as any[]) : [];
    const migrated = migrate(parsed);
    return migrated as WorkItem[];
  } catch {
    return [];
  }
}

function save(items: WorkItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function listItems(): WorkItem[] {
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

async function readAsDataURL(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File, maxDim = 1600): Promise<string> {
  const dataUrl = await readAsDataURL(file);
  return await new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img as HTMLImageElement;
      const scale = Math.min(1, maxDim / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, width, height);
      const out = canvas.toDataURL("image/jpeg", 0.85);
      resolve(out);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function addItem(input: {
  subject: Subject;
  type: WorkType;
  date: string;
  description?: string;
  files?: File[];
}): Promise<WorkItem> {
  let files: WorkFile[] | undefined = undefined;
  if (input.files && input.files.length) {
    files = await Promise.all(
      input.files.map(async (f) => {
        const isImage = /^image\//i.test(f.type);
        const url = isImage ? await compressImage(f) : await readAsDataURL(f);
        return { name: f.name, url, mimeType: f.type } as WorkFile;
      }),
    );
  }

  const item: WorkItem = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    subject: input.subject,
    type: input.type,
    date: input.date,
    description: input.description?.trim() ? input.description : undefined,
    files,
    createdAt: Date.now(),
  };

  const items = load();
  items.push(item);
  save(items);
  return item;
}

export function removeItem(id: string) {
  const items = load().filter((x) => x.id !== id);
  save(items);
}

export function setCompleted(id: string, completed: boolean) {
  const set = new Set<string>(JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]"));
  if (completed) set.add(id);
  else set.delete(id);
  localStorage.setItem(COMPLETED_KEY, JSON.stringify([...set]));
}

export function getCompletedSet(): Set<string> {
  return new Set<string>(JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]"));
}
