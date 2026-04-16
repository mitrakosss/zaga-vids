// /api/seed-admin.js
import { kvGet, kvSet } from "./_lib_kv.js";
import { hashPassword, json } from "./_lib_auth.js";

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
    const raw = await kvGet("zaga:users");
    const users = normalizeUsers(raw);

    const exists = !!users.zagadmin;

    // ✅ ensure admin is correct (don’t wipe other users)
    users.zagadmin = {
      username: "zagadmin",
      passHash: hashPassword("Z@g4l@g!nn"),
      role: "admin",
      status: "approved",
      createdAt: users.zagadmin?.createdAt || Date.now()
    };

    await kvSet("zaga:users", users);

    return json(res, 200, {
      ok: true,
      message: exists ? "Admin already seeded" : "Admin seeded"
    });
  } catch (e) {
    return json(res, 500, { ok: false, message: String(e?.message || e) });
  }
}
