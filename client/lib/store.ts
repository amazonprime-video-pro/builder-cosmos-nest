import { Subject, WorkType } from "@/constants/subjects";
import type { WorkItem, WorkFile } from "@/components/Card";

const KEY = "kv8-work-items";
const COMPLETED_KEY = "kv8-completed-ids";

function load(): WorkItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WorkItem[]) : [];
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
      input.files.map(
        (f) =>
          new Promise<WorkFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({ name: f.name, url: String(reader.result), mimeType: f.type });
            reader.onerror = reject;
            reader.readAsDataURL(f);
          }),
      ),
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
