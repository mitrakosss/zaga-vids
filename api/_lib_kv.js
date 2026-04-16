// /api/_lib_kv.js
import { Redis } from "@upstash/redis";

export const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function isWrongTypeError(e) {
  const msg = String(e?.message || e || "");
  return msg.includes("WRONGTYPE");
}

export async function kvGet(key) {
  // Returns whatever Upstash gives (string/object/null). Caller can normalize.
  return await kv.get(key);
}

export async function kvSet(key, value) {
  // Always store as a STRING when value is object/array.
  const v =
    typeof value === "string" ? value : JSON.stringify(value);

  try {
    return await kv.set(key, v);
  } catch (e) {
    // If key is wrong Redis type (hash/list), delete then set.
    if (isWrongTypeError(e)) {
      try { await kv.del(key); } catch {}
      return await kv.set(key, v);
    }
    throw e;
  }
}

export async function kvDel(key) {
  return await kv.del(key);
}
