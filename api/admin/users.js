// /api/admin/users.js
import { kvGet } from "../_lib_kv.js";
import { getCookie, verifySession, json } from "../_lib_auth.js";

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
    const sess = verifySession(token);
    if (!sess?.username) return json(res, 401, { ok: false });

    const raw = await kvGet("zaga:users");
    const users = normalizeUsers(raw);

    const me = users[sess.username];
    if (!me || me.role !== "admin") return json(res, 403, { ok: false });

    const list = Object.values(users)
      .map((u) => ({
        username: u.username,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt
      }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return json(res, 200, { ok: true, users: list });
  } catch (e) {
    return json(res, 500, { ok: false, message: String(e?.message || e) });
  }
}
