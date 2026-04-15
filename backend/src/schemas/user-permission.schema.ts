import zod from "zod";
import { registry } from "../docs/openapi.registry";

const UserPermissionBaseSchema = zod.object({
  user_id : zod.number().openapi({
    example:1
  }),
  permission_id : zod.number().openapi({
    example:2
  })
}).strict();

export const UserPermissionPayloadSchema = UserPermissionBaseSchema.strict();
registry.register("UserPermissionPayload", UserPermissionPayloadSchema);

export const UserPermissionSchema = UserPermissionBaseSchema.extend({
  created_at: zod.date(),
});
registry.register("UserPermission", UserPermissionSchema);

export type UserPermission = zod.infer<typeof UserPermissionSchema>;
export type UserPermissionPayload = zod.infer<typeof UserPermissionPayloadSchema>;