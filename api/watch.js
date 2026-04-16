import { json, methodNotAllowed, readJSON, requireSession, redisCmd, pushLog } from "./_utils.js";

export default async function handler(req, res){
  if(req.method !== "POST") return methodNotAllowed(res);

  const s = await requireSession(req);
  if(!s) return json(res, 401, { ok:false });

  const body = await readJSON(req);
  const videoId = body.videoId || "";
  const title = body.title || "";

  const entry = {
    t: new Date().toISOString(),
    type: "watch",
    user: s.user,
    videoId,
    title
  };

  // global logs
  await pushLog(entry);

  // per-user history
  const hKey = `history:${s.user}`;
  await redisCmd("lpush", hKey, JSON.stringify(entry));
  await redisCmd("ltrim", hKey, 0, 200);

  return json(res, 200, { ok:true });
}
