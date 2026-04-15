import zod from "zod";
import { registry } from "../docs/openapi.registry";

const PermissionBaseSchema = zod
  .object({
    label: zod
      .string()
      .min(1, "Label is required")
      .max(100, "Label to long (max 100)")
      .trim()
      .refine((label: string): boolean => label !== "", "Label cannot be empty")
      .openapi({
        description: "Label of permission (maximum 100 characters)",
        minLength: 1,
        maxLength: 100,
        example: "Call",
      }),
  })
  .strict();

export const PermissionPayloadSchema = PermissionBaseSchema.strict();
registry.register("PermissionPayload", PermissionPayloadSchema);

export const PermissionSchema = PermissionBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});
registry.register("Permission", PermissionSchema);

export type Permission = zod.infer<typeof PermissionSchema>;
export type PermissionPayload = zod.infer<typeof PermissionPayloadSchema>;
