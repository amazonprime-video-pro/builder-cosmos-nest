import { Subject, WorkType } from "@/constants/subjects";
import type { WorkItem, WorkFile } from "@/components/Card";
import { getSupabaseClient, isRemoteEnabled } from "@/lib/supabase";

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

export async function listItemsAsync(): Promise<WorkItem[]> {
  const client = getSupabaseClient();
  if (!client) return listItems();
  const { data, error } = await client.from("work_items").select("*").order("created_at", { ascending: false });
  if (error) return listItems();
  return (data || []).map((row: any) => ({
    id: row.id,
    subject: row.subject,
    type: row.type,
    date: row.date,
    description: row.description || undefined,
    files: row.files || [],
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  }));
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

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_");
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
    const client = getSupabaseClient();
    if (client) {
      const bucket = client.storage.from("work_uploads");
      const ts = Date.now();
      const [y, m, d] = [input.date.slice(0, 4), input.date.slice(5, 7), input.date.slice(8, 10)];
      files = [];
      for (let i = 0; i < input.files.length; i++) {
        const f = input.files[i];
        const path = `${y}/${m}/${d}/${sanitizeName(input.subject)}/${sanitizeName(input.type)}/${ts}_${i}_${sanitizeName(f.name)}`;
        // Try upload original (faster). If you want compression, swap to compress then upload blob.
        const { error } = await bucket.upload(path, f, { upsert: true, contentType: f.type });
        if (!error) {
          const { data } = bucket.getPublicUrl(path);
          files.push({ name: f.name, url: data.publicUrl, mimeType: f.type });
        } else {
          const isImage = /^image\//i.test(f.type);
          const url = isImage ? await compressImage(f) : await readAsDataURL(f);
          files.push({ name: f.name, url, mimeType: f.type });
        }
      }
    } else {
      files = await Promise.all(
        input.files.map(async (f) => {
          const isImage = /^image\//i.test(f.type);
          const url = isImage ? await compressImage(f) : await readAsDataURL(f);
          return { name: f.name, url, mimeType: f.type } as WorkFile;
        }),
      );
    }
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

  const client = getSupabaseClient();
  if (client) {
    await client.from("work_items").insert({
      id: item.id,
      subject: item.subject,
      type: item.type,
      date: item.date,
      description: item.description || null,
      files: item.files || [],
    });
  }
  return item;
}

export async function removeItem(id: string) {
  const items = load().filter((x) => x.id !== id);
  save(items);
  const client = getSupabaseClient();
  if (client) {
    await client.from("work_items").delete().eq("id", id);
  }
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

export function subscribeItems(onChange: () => void): () => void {
  const client = getSupabaseClient();
  if (client) {
    const channel = client
      .channel("work_items_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "work_items" }, onChange)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "work_items" }, onChange)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "work_items" }, onChange)
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }
  const handler = (e: StorageEvent) => {
    if (e.key === KEY) onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
