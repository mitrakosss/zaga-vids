// /api/register.js
import { kvGet, kvSet } from "./_lib_kv.js";
import { hashPassword, json } from "./_lib_auth.js";

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

async function loadUsers() {
  const raw = await kvGet("zaga:users");
  return normalizeUsers(raw);
}

async function saveUsers(users) {
  await kvSet("zaga:users", users); // ✅ store as object (consistent)
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, message: "Method not allowed" });
  }

  try {
    const params = await parseForm(req);
    const username = (params.get("username") || "").trim();
    const password = params.get("password") || "";

    if (!username || !password) {
      return json(res, 400, { ok: false, message: "Missing username/password" });
    }
    if (username.length < 3) {
      return json(res, 400, { ok: false, message: "Username too short" });
    }
    if (password.length < 4) {
      return json(res, 400, { ok: false, message: "Password too short" });
    }

    const users = await loadUsers();

    if (users[username]) {
      return json(res, 409, { ok: false, message: "Username already exists" });
    }

    users[username] = {
      username,
      passHash: hashPassword(password),
      role: "user",
      status: "pending",
      createdAt: Date.now()
    };

    await saveUsers(users);
    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { ok: false, message: String(e?.message || e) });
  }
}
