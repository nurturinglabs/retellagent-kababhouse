/**
 * Vercel KV (Redis) client with in-memory fallback for local development.
 *
 * When KV_REST_API_URL and KV_REST_API_TOKEN are set (Vercel deployment),
 * data persists across serverless invocations. Otherwise, falls back to a
 * simple in-memory Map so `npm run dev` still works without external deps.
 */

import { createClient, type VercelKV } from "@vercel/kv";

// ---------------------------------------------------------------------------
// Detect whether Vercel KV is available
// ---------------------------------------------------------------------------

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;

const isKVConfigured = !!(kvUrl && kvToken);

let kvClient: VercelKV | null = null;
if (isKVConfigured) {
  kvClient = createClient({ url: kvUrl!, token: kvToken! });
  console.log("[kv] Vercel KV configured — using persistent Redis storage");
} else {
  console.log("[kv] Vercel KV not configured — using in-memory fallback");
}

// ---------------------------------------------------------------------------
// In-memory fallback store
// ---------------------------------------------------------------------------

const memoryStore = new Map<string, unknown>();

// ---------------------------------------------------------------------------
// Thin wrapper that mirrors the subset of KV operations we need
// ---------------------------------------------------------------------------

export async function kvGet<T>(key: string): Promise<T | null> {
  if (kvClient) {
    return kvClient.get<T>(key);
  }
  return (memoryStore.get(key) as T) ?? null;
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  if (kvClient) {
    await kvClient.set(key, value);
  } else {
    memoryStore.set(key, value);
  }
}

export async function kvIncr(key: string): Promise<number> {
  if (kvClient) {
    return kvClient.incr(key);
  }
  const current = (memoryStore.get(key) as number) || 0;
  const next = current + 1;
  memoryStore.set(key, next);
  return next;
}

export { isKVConfigured };
