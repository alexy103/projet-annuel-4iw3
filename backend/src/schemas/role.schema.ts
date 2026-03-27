import zod from "zod";
import { registry } from "../docs/openapi.registry";

const RoleBaseSchema = zod
  .object({
    label: zod
      .string()
      .min(1, "Label is required")
      .max(100, "Label to long (max 100)")
      .trim()
      .refine((label: string): boolean => label !== "", "Label cannot be empty")
      .openapi({
        description: "Label of role (maximum 100 characters)",
        minLength: 1,
        maxLength: 100,
        example: "administrator",
      }),
  })
  .strict();

export const RolePayloadSchema = RoleBaseSchema.strict();
registry.register("RolePayload", RolePayloadSchema);

export const RoleSchema = RoleBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Role", RoleSchema);

export type Role = zod.infer<typeof RoleSchema>;
export type RolePayload = zod.infer<typeof RolePayloadSchema>;
