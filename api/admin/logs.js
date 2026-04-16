import { json, requireAdmin, redisCmd } from "../_utils.js";

export default async function handler(req, res){
  const admin = await requireAdmin(req);
  if(!admin) return json(res, 403, { ok:false });

  if(req.method === "GET"){
    const raw = await redisCmd("lrange", "logs", 0, 60) || [];
    const logs = raw.map(x=>{
      try{ return JSON.parse(x); }catch{ return { t:new Date().toISOString(), type:"bad_log" }; }
    });
    return json(res, 200, { ok:true, logs });
  }

  if(req.method === "DELETE"){
    await redisCmd("del", "logs");
    return json(res, 200, { ok:true });
  }

  return json(res, 405, { ok:false });
}
	