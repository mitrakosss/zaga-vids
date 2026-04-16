import { json, methodNotAllowed, readJSON, requireAdmin, redisCmd, randToken, pushLog } from "../_utils.js";

export default async function handler(req, res){
  if(req.method !== "POST") return methodNotAllowed(res);

  const admin = await requireAdmin(req);
  if(!admin) return json(res, 403, { ok:false });

  const body = await readJSON(req);
  const maxUses = Math.max(1, Math.min(999, parseInt(body.maxUses || "5", 10)));
  const autoApprove = !!body.autoApprove;

  const token = randToken(10);
  const inv = {
    token,
    createdAt: new Date().toISOString(),
    createdBy: admin.user,
    maxUses,
    uses: 0,
    autoApprove
  };

  await redisCmd("set", `invite:${token}`, JSON.stringify(inv));

  const link = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/login.html?invite=${token}`;
  await pushLog({ t:new Date().toISOString(), type:"invite_create", user: admin.user, token });

  return json(res, 200, { ok:true, link });
}
