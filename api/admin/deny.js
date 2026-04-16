// /api/admin/deny.js
import { kvGet, kvSet } from "../_lib_kv.js";
import { getCookie, verifySession, json } from "../_lib_auth.js";

function parseForm(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => resolve(new URLSearchParams(body)));
  });
}

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
  if (req.method !== "POST") return json(res, 405, { ok: false });

  try {
    const token = getCookie(req);
    const sess = verifySession(token);
    if (!sess?.username) return json(res, 401, { ok: false });

    const raw = await kvGet("zaga:users");
    const users = normalizeUsers(raw);

    const me = users[sess.username];
    if (!me || me.role !== "admin") return json(res, 403, { ok: false });

    const params = await parseForm(req);
    const username = (params.get("username") || "").trim();
    if (!users[username]) return json(res, 404, { ok: false });

    users[username].status = "denied";
    await kvSet("zaga:users", users);

    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { ok: false, message: String(e?.message || e) });
  }
}
