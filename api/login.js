// /api/login.js
import { kvGet } from "./_lib_kv.js";
import {
  hashPassword,
  createSession,
  saveSession,
  setCookie,
  json
} from "./_lib_auth.js";

/* -------- helper: read x-www-form-urlencoded body -------- */
function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      const params = new URLSearchParams(data);
      resolve({
        username: (params.get("username") || "").trim(),
        password: params.get("password") || ""
      });
    });
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

async function loadUsers() {
  const raw = await kvGet("zaga:users");
  return normalizeUsers(raw);
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return json(res, 405, { ok: false, message: "Method not allowed" });
    }

    const { username, password } = await readBody(req);

    if (!username || !password) {
      return json(res, 400, { ok: false, message: "Missing fields" });
    }

    const users = await loadUsers();
    const u = users[username];

    if (!u || u.status !== "approved") {
      return json(res, 401, { ok: false, message: "Invalid credentials or not approved" });
    }

    if (u.passHash !== hashPassword(password)) {
      return json(res, 401, { ok: false, message: "Invalid credentials" });
    }

    const session = createSession({ username: u.username, role: u.role || "user" });

    await saveSession(session);
    setCookie(res, session.token);

    return json(res, 200, {
      ok: true,
      username: u.username,
      role: u.role || "user"
    });
  } catch (e) {
    return json(res, 500, { ok: false, message: String(e?.message || e) });
  }
}
