// /api/_lib_auth.js
import crypto from "crypto";

const COOKIE = "zaga_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// ΒΑΛΕ ΣΤΑ ENV: SESSION_SECRET="κάτι-μεγάλο-τυχαίο"
const SECRET =
  process.env.SESSION_SECRET ||
  process.env.KV_REST_API_TOKEN || // fallback για να δουλέψει άμεσα
  "DEV_INSECURE_CHANGE_ME";

function b64urlEncode(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function b64urlDecode(str) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  return Buffer.from(s + pad, "base64").toString("utf8");
}

function sign(input) {
  return b64urlEncode(
    crypto.createHmac("sha256", SECRET).update(input).digest()
  );
}

/** ✅ salt helper (used by register + seed-admin) */
export function makeSalt(len = 16) {
  return crypto.randomBytes(len).toString("hex");
}

/**
 * ✅ Hash password with optional salt (stable)
 * NOTE: Αν δεν υπάρχει salt, λειτουργεί με κενό salt.
 */
export function hashPassword(pw, salt = "") {
  const s = String(salt || "");
  const p = String(pw || "");
  return crypto.createHash("sha256").update(`${s}:${p}`).digest("hex");
}

/**
 * Δημιουργεί signed session token (stateless).
 * payload: { username, role, iat, exp }
 */
export function createSession(arg) {
  const username = typeof arg === "string" ? arg : arg?.username;
  const role = typeof arg === "string" ? "user" : (arg?.role || "user");

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    username,
    role,
    iat: now,
    exp: now + SESSION_TTL_SECONDS
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = b64urlEncode(payloadStr);
  const sig = sign(payloadB64);

  return { token: `${payloadB64}.${sig}`, username, role };
}

/**
 * Stateless sessions => δεν αποθηκεύουμε sessions σε KV.
 * (μένει για compatibility)
 */
export async function saveSession(_sessionOrToken, _username) {
  return;
}

/** Read cookie token */
export function getCookie(req) {
  const c = req?.headers?.cookie || "";
  const m = c.match(new RegExp(`${COOKIE}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * VERIFY είναι SYNC (ώστε να δουλεύει και όπου δεν υπάρχει await)
 */
export function verifySession(token) {
  try {
    if (!token) return null;

    const parts = String(token).split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, sig] = parts;
    const expected = sign(payloadB64);
    if (sig !== expected) return null;

    const payload = JSON.parse(b64urlDecode(payloadB64));

    const now = Math.floor(Date.now() / 1000);
    if (!payload?.username) return null;
    if (payload?.exp && now > payload.exp) return null;

    return payload; // { username, role, iat, exp }
  } catch {
    return null;
  }
}

/** Set cookie */
export function setCookie(res, token) {
  const isProd = !!process.env.VERCEL || process.env.NODE_ENV === "production";

  const cookie = [
    `${COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isProd ? "Secure" : ""
  ].filter(Boolean).join("; ");

  res.setHeader("Set-Cookie", cookie);
}

/** Clear cookie */
export function clearCookie(res) {
  const isProd = !!process.env.VERCEL || process.env.NODE_ENV === "production";

  const cookie = [
    `${COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Max-Age=0",
    "SameSite=Lax",
    isProd ? "Secure" : ""
  ].filter(Boolean).join("; ");

  res.setHeader("Set-Cookie", cookie);
}

/**
 * ✅ Backwards compatible alias
 * (για να μην ξανασπάσει αν κάπου το λένε clearSessionCookie)
 */
export function clearSessionCookie(res) {
  return clearCookie(res);
}

export function json(res, status, data) {
  res.status(status).json(data);
}
