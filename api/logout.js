// /api/logout.js
import { clearCookie, json } from "./_lib_auth.js";

export default async function handler(req, res) {
  clearCookie(res);
  return json(res, 200, { ok: true });
}
