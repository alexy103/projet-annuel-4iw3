import zod from "zod";
import { registry } from "../docs/openapi.registry";

export const UserSessionSchema = zod.object({
  id: zod.number(),
  user_id : zod.number(),
  refresh_token_hash : zod.string(),
  user_agent : zod.string(),
  ip_address : zod.string().min(1).max(50),
  expired_at : zod.date(),
  created_at: zod.date(),
});

registry.register("UserSession", UserSessionSchema);

export type UserSession = zod.infer<typeof UserSessionSchema>;