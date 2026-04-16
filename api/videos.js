// /api/videos.js
import { kvGet } from "./_lib_kv.js";
import { getCookie, verifySession, json } from "./_lib_auth.js";

const VIDEOS = [
  { "id": "Q_LtlLbX_0U", "title": "Βελιγράδι - Δεκέμβριος 2025", "date": "2026-01-08" },
  { "id": "EYghvV-XHH8", "title": "Moutoparea Rewind 2025", "date": "2026-01-08" },
  { "id": "34TF95HPhIU", "title": "Ιανουάριος 2026", "date": "2026-01-07" },
  { "id": "xN9gz5OvsUE", "title": "PaPo - Kourmpali", "date": "2025-12-01" },
  { "id": "Sgq4n4GoFmA", "title": "Άυγουστος 2025", "date": "2025-08-16" },
  { "id": "NswG5BHTTBY", "title": "Πάκε Έχεις Ταλέντο", "date": "2025-07-07" },
  { "id": "9Oq4mZPHem4", "title": "Mystery Box - Rewind 2024", "date": "2024-12-31" },
  { "id": "gadqZOma20o", "title": "Γενέθλια Κλεάνδρου 2024", "date": "2024-11-03" },
  { "id": "cQ0RV26Uv2Y", "title": "Άυγουστος 2024", "date": "2024-08-14" }
];

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
    const u = users[sess.username];

    if (!u || u.status !== "approved") return json(res, 401, { ok: false });

    return json(res, 200, { ok: true, videos: VIDEOS });
  } catch (e) {
    return json(res, 500, { ok: false, message: String(e?.message || e) });
  }
}
