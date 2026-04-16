// /api/me.js
import { kvGet } from "./_lib_kv.js";
import { getCookie, verifySession, json } from "./_lib_auth.js";

function normalizeUsers(raw) {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw;
  return {};
}

export default async function handler(req, res) {
  try {
    const token = getCookie(req);
    const sess = verifySession(token); // ✅ sync
    if (!sess?.username) return json(res, 401, { ok: false });

    const raw = await kvGet("zaga:users");
    const users = normalizeUsers(raw);

    const u = users[sess.username];
    if (!u || u.status !== "approved") return json(res, 401, { ok: false });

    return json(res, 200, {
      ok: true,
      username: u.username,
      role: u.role || "user"
    });
  } catch (e) {
    return json(res, 500, { ok: false, message: String(e?.message || e) });
  }
}
