import { openDB } from "idb";

const DB_NAME = "censo-mascotas-pwa";
const STORE_NAME = "request-queue";

export type QueuedRequest = {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  createdAt: number;
};

const getDb = () =>
  openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });

export const enqueueRequest = async (
  request: Omit<QueuedRequest, "id" | "createdAt">,
) => {
  const db = await getDb();
  const record: QueuedRequest = {
    ...request,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  await db.put(STORE_NAME, record);
};

export const flushQueue = async () => {
  const db = await getDb();
  const all = await db.getAll(STORE_NAME);
  if (all.length === 0) return;

  for (const item of all) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body ?? undefined,
      });
      if (res.ok) {
        await db.delete(STORE_NAME, item.id);
      }
    } catch {
      // Mantener en cola si aun no hay conexion
      break;
    }
  }
};

export const initOfflineQueue = () => {
  window.addEventListener("online", () => {
    void flushQueue();
  });

  if (navigator.onLine) {
    void flushQueue();
  }
};
